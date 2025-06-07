import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ConductExpectationsAlbertaEducationResponsibilities = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scenarioAnswers, setScenarioAnswers] = useState({});
  const [digitalFootprintAnswers, setDigitalFootprintAnswers] = useState({});
  const [reflectionInput, setReflectionInput] = useState('');
  const [showAIReflection, setShowAIReflection] = useState(false);

  // Digital Footprint Assessment Data
  const digitalFootprintScenarios = [
    {
      id: 'social_media',
      scenario: 'Posting negative comments about RTD Academy on social media',
      goodChoice: 'Speak directly with your instructor or administration about concerns',
      poorChoice: 'Public negative posts can damage relationships and your reputation',
      category: 'Professional Representation'
    },
    {
      id: 'exam_sharing',
      scenario: 'A friend asks you to share exam questions from your physics test',
      goodChoice: 'Politely decline and explain academic integrity policies',
      poorChoice: 'Sharing exam content violates academic integrity and trust',
      category: 'Academic Integrity'
    },
    {
      id: 'personal_info',
      scenario: 'Another student asks for your login credentials to "help" with an assignment',
      goodChoice: 'Never share credentials - offer to help them contact IT support instead',
      poorChoice: 'Sharing logins compromises security and violates privacy policies',
      category: 'Privacy & Security'
    },
    {
      id: 'recording',
      scenario: 'You want to record a virtual class session for later review',
      goodChoice: 'Ask instructor permission first and follow school recording policies',
      poorChoice: 'Recording without permission violates privacy and may be illegal',
      category: 'Digital Rights'
    }
  ];

  const handleScenarioAnswer = (scenarioId, answer) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenarioId]: answer
    }));
  };

  const handleDigitalFootprintAnswer = (scenarioId, choice) => {
    setDigitalFootprintAnswers(prev => ({
      ...prev,
      [scenarioId]: choice
    }));
  };

  const handleReflectionChange = (value) => {
    setReflectionInput(value);
    
    // Show AI feedback when user writes a substantial reflection (50+ characters)
    if (value.length > 50 && !showAIReflection) {
      setShowAIReflection(true);
    }
  };

  const calculateDigitalFootprintScore = () => {
    const correctAnswers = digitalFootprintScenarios.filter(scenario => 
      digitalFootprintAnswers[scenario.id] === 'good'
    ).length;
    return { correct: correctAnswers, total: digitalFootprintScenarios.length };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Digital Citizenship, Online Conduct & Responsibilities</h1>
        <p className="text-xl mb-6">Learn to be a respectful, responsible, and ethical member of our online learning community</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand RTD Academy's standards for digital citizenship, 
            learn about online safety and privacy protection, recognize professional communication expectations, 
            and develop awareness of your digital footprint in educational settings.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Digital Citizenship Overview' },
            { id: 'communication', label: 'Online Communication' },
            { id: 'privacy', label: 'Privacy & Security' },
            { id: 'footprint', label: 'Digital Footprint' },
            { id: 'cyberbullying', label: 'Cyberbullying & Safety' },
            { id: 'cell_phone', label: 'Mobile Device Policy' },
            { id: 'scenarios', label: 'Real-World Scenarios' },
            { id: 'reflection', label: 'Personal Reflection' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Digital Citizenship Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-teal-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-teal-900">🌐 What is Digital Citizenship?</h2>
            <p className="text-gray-700 mb-4">
              Digital citizenship means using technology in a safe, respectful, and productive way. At RTD Academy, 
              we expect our students to be respectful, responsible, and ethical members of our virtual learning community.
            </p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-teal-800 font-medium">
                💡 Think of digital citizenship as the same principles you'd follow in a physical classroom, 
                but applied to our online learning environment.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">🏛️ The Five Pillars of Digital Citizenship at RTD</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-800">1. Respectful Online Behavior</h4>
                  <p className="text-sm text-gray-600">Professional, inclusive communication in all virtual interactions</p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-800">2. Academic Integrity & Ethics</h4>
                  <p className="text-sm text-gray-600">Honest work, proper citations, and ethical use of technology</p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-purple-800">3. Privacy & Security</h4>
                  <p className="text-sm text-gray-600">Protecting personal information and respecting others' privacy</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-800">4. Digital Footprint Awareness</h4>
                  <p className="text-sm text-gray-600">Understanding that online actions have lasting consequences</p>
                </div>
                
                <div className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-semibold text-red-800">5. Zero Tolerance for Cyberbullying</h4>
                  <p className="text-sm text-gray-600">Creating a safe, supportive environment for all learners</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Why Digital Citizenship Matters</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">For Your Education:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Creates a positive learning environment</li>
                    <li>• Builds trust with instructors and peers</li>
                    <li>• Enhances collaboration and support</li>
                    <li>• Ensures fair assessment conditions</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">For Your Future:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Develops professional online presence</li>
                    <li>• Builds digital literacy skills for career success</li>
                    <li>• Creates positive digital reputation</li>
                    <li>• Demonstrates responsibility to future employers</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">For Our Community:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Maintains academic integrity standards</li>
                    <li>• Protects everyone's privacy and safety</li>
                    <li>• Supports inclusive learning environment</li>
                    <li>• Upholds RTD Academy's reputation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚖️ Digital Citizenship Agreement</h3>
            <p className="text-gray-700 mb-4">
              By engaging with RTD Academy courses and community, students agree to uphold these digital citizenship standards. 
              Violations may lead to disciplinary action, including:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold text-yellow-800 mb-1">First Warning</h4>
                <p className="text-gray-600">Educational discussion about digital citizenship expectations</p>
              </div>
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold text-orange-800 mb-1">Restricted Access</h4>
                <p className="text-gray-600">Temporary limits on platform access or participation</p>
              </div>
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold text-red-800 mb-1">Administrative Review</h4>
                <p className="text-gray-600">Formal review process that may impact enrollment</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Online Communication Section */}
      {activeSection === 'communication' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">💬 Professional Online Communication</h2>
            <p className="text-gray-600 mb-6">
              Learn how to communicate effectively and professionally in all RTD Academy platforms and interactions.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📧 Email Communication Standards</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">✅ Professional Email Format</h4>
                  <div className="bg-white rounded p-3 font-mono text-sm">
                    <p><strong>Subject:</strong> Math 30-1: Question about Section 2 Assignment</p>
                    <p className="mt-2"><strong>Dear Mr. Johnson,</strong></p>
                    <p className="mt-2">I hope this email finds you well. I'm having difficulty understanding the quadratic formula applications in Section 2, specifically question 5.</p>
                    <p className="mt-2">Could you please clarify the steps for factoring when the coefficient of x² is greater than 1?</p>
                    <p className="mt-2">Thank you for your time and assistance.</p>
                    <p className="mt-2"><strong>Best regards,<br/>Sarah Thompson<br/>Student ID: 12345678</strong></p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">📝 Key Elements</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Clear, descriptive subject line</li>
                    <li>• Appropriate greeting (Dear, Hello)</li>
                    <li>• Polite, respectful tone</li>
                    <li>• Specific, clear request or question</li>
                    <li>• Professional closing</li>
                    <li>• Full name and student ID</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">❌ Poor Email Example</h4>
                  <div className="bg-white rounded p-3 font-mono text-sm">
                    <p><strong>Subject:</strong> help!!!</p>
                    <p className="mt-2">hey</p>
                    <p className="mt-2">i dont get this math stuff can u help me out its really hard and i need to pass this class plz respond asap!!!</p>
                    <p className="mt-2">-student</p>
                  </div>
                  <div className="mt-3">
                    <h5 className="font-semibold text-red-700 mb-1">Problems:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Vague subject line with excessive punctuation</li>
                      <li>• No proper greeting or courtesy</li>
                      <li>• Unclear request - what specifically needs help?</li>
                      <li>• Informal language and poor grammar</li>
                      <li>• No identification or contact information</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-700 mb-2">💡 Quick Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Write your email like you're speaking to a teacher in person</li>
                    <li>• Proofread before sending</li>
                    <li>• Use proper spelling and grammar</li>
                    <li>• Be patient - allow 24-48 hours for responses</li>
                    <li>• Include context about which course/lesson</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">💭 Discussion Forum Guidelines</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">✅ Effective Discussion Posts</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Stay on topic:</strong> Keep posts relevant to the course material or discussion prompt</li>
                  <li><strong>• Add value:</strong> Share insights, ask thoughtful questions, or help clarify concepts</li>
                  <li><strong>• Use evidence:</strong> Reference course materials, examples, or credible sources</li>
                  <li><strong>• Respond thoughtfully:</strong> Build on others' ideas respectfully</li>
                  <li><strong>• Be constructive:</strong> If you disagree, explain your perspective politely</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">❌ Avoid These Behaviors</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Off-topic posts:</strong> Personal stories unrelated to coursework</li>
                  <li><strong>• One-word responses:</strong> "I agree" or "Good point" without explanation</li>
                  <li><strong>• Attacking ideas personally:</strong> "That's stupid" instead of explaining disagreement</li>
                  <li><strong>• Sharing homework answers:</strong> Violates academic integrity policies</li>
                  <li><strong>• Late or rushed posts:</strong> Shows lack of engagement with material</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📹 Virtual Meeting Expectations</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">🎭 Professional Appearance</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-orange-700">Dress Code Requirements:</h5>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• Appropriate clothing that covers upper and lower body</li>
                        <li>• Face must remain visible during exams</li>
                        <li>• No offensive language, images, or symbols</li>
                        <li>• Professional standard as in physical classroom</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-orange-700">Background Setup:</h5>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        <li>• Neutral, non-distracting backgrounds</li>
                        <li>• Teams blur/virtual backgrounds allowed (not during exams)</li>
                        <li>• No offensive or inappropriate elements visible</li>
                        <li>• Consider lighting and camera position</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">⏰ Meeting Etiquette</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Join sessions on time with materials ready</li>
                    <li>• Use your real name matching school records</li>
                    <li>• Mute microphone when not speaking</li>
                    <li>• Use chat for questions during presentations</li>
                    <li>• Stay engaged and avoid multitasking</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">🔧 Technical Preparation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Test camera and microphone beforehand</li>
                    <li>• Ensure stable internet connection</li>
                    <li>• Have backup plan for technical issues</li>
                    <li>• Close unnecessary applications</li>
                    <li>• Keep charger nearby for longer sessions</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">📝 Exam-Specific Requirements</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Camera must remain on throughout exam</li>
                    <li>• Face must be clearly visible at all times</li>
                    <li>• No blurred backgrounds during assessments</li>
                    <li>• Follow all proctoring instructions carefully</li>
                    <li>• Maintain professional appearance standards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-teal-800">🎯 Communication Best Practices Summary</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Tone & Language:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Be polite and respectful</li>
                  <li>• Use inclusive language</li>
                  <li>• Avoid sarcasm or jokes that might be misunderstood</li>
                  <li>• Think before you type</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Clarity & Purpose:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Be specific about what you need</li>
                  <li>• Provide context and details</li>
                  <li>• Use clear, concise sentences</li>
                  <li>• Proofread before sending</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timing & Response:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Allow 24-48 hours for email responses</li>
                  <li>• Respond promptly to instructor requests</li>
                  <li>• Use appropriate channels for urgency</li>
                  <li>• Respect time zones and schedules</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Privacy & Security Section */}
      {activeSection === 'privacy' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🔒 Privacy & Security in Online Learning</h2>
            <p className="text-gray-600 mb-6">
              Learn how to protect your personal information and respect others' privacy in digital learning environments.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Critical Security Rules</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Never Share Your Login Credentials
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Your username and password are yours alone.</strong> Never share them with anyone, including friends, 
                    family members, or classmates who offer to "help" with assignments.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Why this matters:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Sharing logins violates RTD Academy policies</li>
                      <li>• Someone else could submit work as you</li>
                      <li>• Your grades and academic record could be compromised</li>
                      <li>• Security breaches affect the entire school community</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    No Unauthorized Recording
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Recording live sessions, virtual meetings, or online content without explicit permission is forbidden 
                    and may violate privacy laws.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Proper procedure:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Always ask instructor permission before recording</li>
                      <li>• Respect if permission is denied</li>
                      <li>• Follow any conditions set by the instructor</li>
                      <li>• Never record other students without their consent</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Protect Personal Information
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Be mindful of what personal information you share in online spaces, even with classmates and instructors.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <p className="font-medium text-green-700">Safe to Share:</p>
                      <p className="text-gray-600">First name, course questions, academic interests</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="font-medium text-red-700">Keep Private:</p>
                      <p className="text-gray-600">Address, phone, social media, family details</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Respect Others' Privacy
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Just as you want your information protected, respect the privacy of your classmates and instructors.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Don't share screenshots of private conversations</li>
                      <li>• Avoid discussing other students' grades or personal situations</li>
                      <li>• Don't attempt to access others' accounts or files</li>
                      <li>• Report privacy violations to instructors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🛡️ Smart Online Security Practices</h3>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">💪 Strong Passwords</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700">Good Password:</h5>
                    <p className="text-xs font-mono text-gray-600 mt-1">Math30Study2024!</p>
                    <ul className="text-xs text-gray-600 mt-2 space-y-1">
                      <li>✅ 12+ characters</li>
                      <li>✅ Mix of letters, numbers, symbols</li>
                      <li>✅ Meaningful but not personal</li>
                      <li>✅ Unique to RTD Academy</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-red-700">Poor Password:</h5>
                    <p className="text-xs font-mono text-gray-600 mt-1">password123</p>
                    <ul className="text-xs text-gray-600 mt-2 space-y-1">
                      <li>❌ Too common and predictable</li>
                      <li>❌ Too short</li>
                      <li>❌ Easy to guess</li>
                      <li>❌ Reused from other accounts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🔐 Account Security</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Log out completely:</strong> Don't just close the browser window</li>
                  <li><strong>• Use trusted devices:</strong> Avoid public computers when possible</li>
                  <li><strong>• Check login notifications:</strong> Report suspicious activity</li>
                  <li><strong>• Update browsers:</strong> Keep software current for security</li>
                  <li><strong>• Use secure networks:</strong> Avoid public WiFi for sensitive work</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">📱 Device Protection</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Lock your devices:</strong> Use PIN, password, or biometrics</li>
                  <li><strong>• Install updates:</strong> Keep operating systems current</li>
                  <li><strong>• Use antivirus:</strong> Protect against malware</li>
                  <li><strong>• Backup important work:</strong> Don't rely on single device</li>
                  <li><strong>• Secure your workspace:</strong> Others shouldn't see your screen</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🚨 Recognizing and Reporting Security Issues</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">⚠️ Warning Signs</h4>
                <p className="text-sm text-gray-700 mb-3">Watch out for these potential security threats:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Suspicious login alerts:</strong> Notifications of access you didn't initiate</li>
                  <li><strong>• Changed account details:</strong> Password, email, or profile information altered</li>
                  <li><strong>• Unknown submissions:</strong> Assignments or activities you didn't complete</li>
                  <li><strong>• Phishing attempts:</strong> Fake emails asking for login information</li>
                  <li><strong>• Unusual system behavior:</strong> Slow performance or unexpected messages</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">📞 How to Report Issues</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-red-700">Immediate Action:</h5>
                    <ol className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>1. Change your password immediately</li>
                      <li>2. Log out of all devices</li>
                      <li>3. Document what happened (screenshots if safe)</li>
                      <li>4. Contact IT support: stan@rtdacademy.com</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-red-700">For Privacy Violations:</h5>
                    <ol className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>1. Save evidence of the violation</li>
                      <li>2. Report to instructor or administration</li>
                      <li>3. Contact charlie@rtdacademy.com for serious issues</li>
                      <li>4. Follow up if needed</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-teal-800">🎯 Privacy & Security Checklist</h3>
            <p className="text-teal-700 text-sm mb-3">Use this checklist to maintain good security habits:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Daily Practices:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Log out when finished studying</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Check for login notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Use secure internet connection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Keep workspace private</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Weekly Review:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Review account activity</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Update software if needed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Backup important work</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Clear browser cache/cookies</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Digital Footprint Section */}
      {activeSection === 'footprint' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">👣 Understanding Your Digital Footprint</h2>
            <p className="text-gray-600 mb-6">
              Learn how your online actions create a lasting digital footprint and how to manage your digital reputation responsibly.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🔍 What is a Digital Footprint?</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">💭 Think of It This Way</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Just like footprints in sand, every action you take online leaves a trace. Your digital footprint 
                    is the trail of data you create when using the internet, including:
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-2">Your Digital Trail Includes:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Posts and comments on social media</li>
                      <li>• Emails and messages sent</li>
                      <li>• Photos and videos uploaded</li>
                      <li>• Websites visited and searches made</li>
                      <li>• Online purchases and reviews</li>
                      <li>• Educational platform activities</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✨ Active vs. Passive Footprints</h4>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700">Active Footprint:</h5>
                      <p className="text-xs text-gray-600">Information you deliberately share (posts, comments, uploads)</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-purple-700">Passive Footprint:</h5>
                      <p className="text-xs text-gray-600">Data collected about you (browsing history, location data, cookies)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">⏰ Digital Footprints are Permanent</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Unlike footprints in sand that wash away, digital footprints can last forever. Even "deleted" 
                    content may still exist in:
                  </p>
                  
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Screenshots saved by others</li>
                    <li>• Cached versions on search engines</li>
                    <li>• Archive websites like Wayback Machine</li>
                    <li>• Social media company servers</li>
                    <li>• Other people's memory and reputation</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">🎯 Why Your Digital Footprint Matters</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Future Education:</strong> Universities and colleges often review applicants' online presence</p>
                    <p><strong>Career Opportunities:</strong> Employers regularly search candidates online before hiring</p>
                    <p><strong>Personal Relationships:</strong> Friends, family, and potential partners may find your content</p>
                    <p><strong>Legal Implications:</strong> Some online behavior can have legal consequences</p>
                    <p><strong>Academic Integrity:</strong> School officials can find evidence of policy violations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🎭 Interactive Scenario Assessment</h3>
            <p className="text-gray-600 mb-4">
              For each scenario below, choose whether the action would create a positive or negative digital footprint:
            </p>
            
            <div className="space-y-4">
              {digitalFootprintScenarios.map((scenario, index) => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold mb-2">{scenario.scenario}</h4>
                      <p className="text-sm text-gray-600 mb-3">Category: {scenario.category}</p>
                      
                      <div className="space-y-2">
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={scenario.id}
                            value="good"
                            onChange={() => handleDigitalFootprintAnswer(scenario.id, 'good')}
                            className="mt-1 text-green-600"
                          />
                          <div className="flex-grow">
                            <span className="text-sm font-medium text-green-700">Good Choice</span>
                            <p className="text-xs text-gray-600">{scenario.goodChoice}</p>
                          </div>
                        </label>
                        
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={scenario.id}
                            value="poor"
                            onChange={() => handleDigitalFootprintAnswer(scenario.id, 'poor')}
                            className="mt-1 text-red-600"
                          />
                          <div className="flex-grow">
                            <span className="text-sm font-medium text-red-700">Poor Choice</span>
                            <p className="text-xs text-gray-600">{scenario.poorChoice}</p>
                          </div>
                        </label>
                      </div>
                      
                      {digitalFootprintAnswers[scenario.id] && (
                        <div className={`mt-3 p-3 rounded ${
                          digitalFootprintAnswers[scenario.id] === 'good' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {digitalFootprintAnswers[scenario.id] === 'good' 
                            ? '✅ Excellent choice! This demonstrates responsible digital citizenship.'
                            : '❌ This choice could create negative consequences for your digital reputation.'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(digitalFootprintAnswers).length === digitalFootprintScenarios.length && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Your Digital Footprint Awareness Score</h4>
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    calculateDigitalFootprintScore().correct >= 3 ? 'text-green-600' : 
                    calculateDigitalFootprintScore().correct >= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {calculateDigitalFootprintScore().correct}/{calculateDigitalFootprintScore().total}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-blue-700">
                      {calculateDigitalFootprintScore().correct >= 3 && "Outstanding! You understand how to maintain a positive digital footprint."}
                      {calculateDigitalFootprintScore().correct === 2 && "Good awareness! Review the scenarios you missed to strengthen your understanding."}
                      {calculateDigitalFootprintScore().correct < 2 && "Consider reviewing digital citizenship principles to better protect your online reputation."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🛠️ Managing Your Digital Footprint</h3>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">✅ Proactive Strategies</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Think before you post:</strong> Would you be comfortable with your grandmother, future employer, or teacher seeing this?</li>
                  <li><strong>• Use privacy settings:</strong> Control who can see your social media posts and personal information</li>
                  <li><strong>• Google yourself:</strong> Regularly search your name to see what others can find</li>
                  <li><strong>• Create positive content:</strong> Volunteer work, academic achievements, helpful contributions</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🔧 Damage Control</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Delete inappropriate content:</strong> Remove posts, photos, or comments that don't represent you well</li>
                  <li><strong>• Untag yourself:</strong> Remove your name from others' inappropriate posts</li>
                  <li><strong>• Request removal:</strong> Ask others to delete content featuring you</li>
                  <li><strong>• Report violations:</strong> Use platform tools to report cyberbullying or harassment</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">📱 Platform-Specific Tips</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Social Media:</strong> Use professional profile photos, avoid controversial topics</li>
                  <li><strong>• Email:</strong> Use appropriate addresses for school (not partyqueen2024@...)</li>
                  <li><strong>• Learning Platforms:</strong> Maintain professional tone in all communications</li>
                  <li><strong>• Gaming/Forums:</strong> Use respectful usernames and avoid toxic behavior</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-orange-800">🎯 Digital Footprint Action Plan</h3>
            <p className="text-orange-700 text-sm mb-4">
              Use this action plan to start managing your digital footprint today:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">This Week:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Google your full name and review results</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Review privacy settings on all social media accounts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Delete any inappropriate posts or photos</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Update profile information to be more professional</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">This Month:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Create positive content (achievements, volunteering)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Unfollow or mute accounts that post inappropriate content</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Set up Google alerts for your name</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-orange-600" />
                    <span className="text-sm">Practice the "grandmother test" before posting anything</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cyberbullying & Safety Section */}
      {activeSection === 'cyberbullying' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🛡️ Cyberbullying Prevention & Online Safety</h2>
            <p className="text-gray-600 mb-6">
              Learn to recognize, prevent, and respond to cyberbullying while creating a safe, supportive online learning environment for everyone.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 RTD Academy's Zero Tolerance Policy</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">❌ What is Cyberbullying?</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Cyberbullying is the use of electronic communication to bully a person, typically by sending messages 
                  of an intimidating or threatening nature.
                </p>
                
                <div className="bg-white rounded p-3">
                  <h5 className="font-semibold text-sm text-red-700 mb-2">Examples of cyberbullying include:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Sending threatening or harassing messages</li>
                    <li>• Spreading rumors or false information online</li>
                    <li>• Sharing embarrassing photos or videos without consent</li>
                    <li>• Excluding someone from online groups intentionally</li>
                    <li>• Creating fake profiles to impersonate or mock someone</li>
                    <li>• Posting hurtful comments on someone's work or appearance</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">⚖️ RTD Academy's Response</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>RTD Math Academy has a zero-tolerance policy for cyberbullying.</strong> Any incidents will be 
                  taken seriously and may result in immediate disciplinary action.
                </p>
                
                <div className="space-y-2">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700">Immediate Actions:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Investigation of reported incidents</li>
                      <li>• Documentation and evidence preservation</li>
                      <li>• Contact with all involved parties</li>
                      <li>• Support provided to affected students</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700">Potential Consequences:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Warning and education about digital citizenship</li>
                      <li>• Restricted access to communication platforms</li>
                      <li>• Meeting with parents/guardians</li>
                      <li>• Suspension or removal from courses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🔍 Recognizing Cyberbullying</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">⚠️ Warning Signs You're Being Cyberbullied</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Receiving threatening messages:</strong> Direct threats of harm or intimidation</li>
                  <li><strong>• Persistent harassment:</strong> Repeated unwanted contact or comments</li>
                  <li><strong>• Public humiliation:</strong> Embarrassing content shared in group chats or forums</li>
                  <li><strong>• Identity theft:</strong> Someone pretending to be you online</li>
                  <li><strong>• Exclusion:</strong> Being intentionally left out of online study groups or activities</li>
                  <li><strong>• Spreading rumors:</strong> False information being shared about you</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">🤔 Ask Yourself</h4>
                <p className="text-sm text-gray-700 mb-3">If you're unsure whether something counts as cyberbullying, consider:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Intent:</strong> Is the person trying to hurt or intimidate?</li>
                  <li><strong>• Impact:</strong> How does this make you feel? Scared? Humiliated? Angry?</li>
                  <li><strong>• Imbalance:</strong> Does the other person have more power or influence?</li>
                  <li><strong>• Repetition:</strong> Is this happening repeatedly over time?</li>
                  <li><strong>• Publicity:</strong> Are others watching or participating?</li>
                </ul>
                
                <div className="mt-3 p-3 bg-white rounded">
                  <p className="text-xs text-purple-700 font-medium">
                    Remember: If it feels wrong and makes you uncomfortable, it's worth reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🛠️ How to Respond to Cyberbullying</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✅ If You're Being Bullied</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-2">Immediate Actions:</h5>
                      <ol className="text-xs text-gray-600 space-y-1">
                        <li>1. <strong>Don't respond:</strong> Engaging often makes the situation worse</li>
                        <li>2. <strong>Document everything:</strong> Take screenshots of messages, posts, or comments</li>
                        <li>3. <strong>Block the person:</strong> Use platform tools to block further contact</li>
                        <li>4. <strong>Report immediately:</strong> Contact your instructor or administration</li>
                      </ol>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-2">Ongoing Support:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Talk to trusted friends, family, or counselors</li>
                        <li>• Keep records of all incidents</li>
                        <li>• Follow up with school administration</li>
                        <li>• Focus on positive online activities and communities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">👀 If You Witness Cyberbullying</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>• Don't join in:</strong> Even if it seems like "just joking," don't participate</li>
                    <li><strong>• Support the victim:</strong> Send a private message of support</li>
                    <li><strong>• Document evidence:</strong> Screenshots can help in reporting</li>
                    <li><strong>• Report the incident:</strong> Tell a trusted adult or school administrator</li>
                    <li><strong>• Encourage reporting:</strong> Help the victim understand their options</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">📞 Who to Contact at RTD Academy</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-yellow-700">For Immediate Support:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <strong>Charlie Hiles (Vice Principal):</strong> charlie@rtdacademy.com</li>
                        <li>• <strong>Kyle Brown (Principal):</strong> kyle@rtdacademy.com</li>
                        <li>• <strong>Your Course Instructor:</strong> Contact through LMS or email</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-yellow-700">For Technical Issues:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <strong>Stan Scott (IT Support):</strong> stan@rtdacademy.com</li>
                        <li>• Issues with blocking users or reporting functions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">🚨 Emergency Resources</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    If cyberbullying involves threats of physical harm or makes you feel unsafe:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Contact local police: 911 (emergencies)</li>
                    <li>• Kids Help Phone: 1-800-668-6868</li>
                    <li>• Crisis Text Line: Text HOME to 686868</li>
                    <li>• Tell a trusted adult immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">💡 Creating a Positive Online Environment</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">🌟 Be an Upstander</h4>
                <p className="text-sm text-gray-700 mb-3">Instead of being a bystander, be an upstander who actively promotes positive behavior:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Support classmates who are struggling</li>
                  <li>• Celebrate others' achievements</li>
                  <li>• Include everyone in group activities</li>
                  <li>• Speak up against inappropriate behavior</li>
                  <li>• Model respectful communication</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">💬 Positive Communication</h4>
                <p className="text-sm text-gray-700 mb-3">Practice these communication habits in all online interactions:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use encouraging and supportive language</li>
                  <li>• Ask before sharing someone else's information</li>
                  <li>• Respect different opinions and perspectives</li>
                  <li>• Offer help when classmates need assistance</li>
                  <li>• Say thank you and show appreciation</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🎯 Building Digital Empathy</h4>
                <p className="text-sm text-gray-700 mb-3">Remember there are real people behind every screen name:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Consider how your words might affect others</li>
                  <li>• Remember that tone can be misunderstood online</li>
                  <li>• Give people the benefit of the doubt</li>
                  <li>• Apologize when you make mistakes</li>
                  <li>• Treat others as you want to be treated</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-teal-800">🛡️ Personal Safety Commitment</h3>
            <p className="text-teal-700 text-sm mb-4">
              Make a commitment to maintaining a safe, respectful online learning environment:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">I will:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Treat all classmates and instructors with respect</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Report cyberbullying when I see it</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Support classmates who are being targeted</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Think before I post or comment</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">I will not:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Participate in or encourage cyberbullying</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Share personal information about others</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Exclude others from group activities intentionally</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Ignore cyberbullying when I witness it</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mobile Device Policy Section */}
      {activeSection === 'cell_phone' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📱 Mobile Device Policy & Exam Security</h2>
            <p className="text-gray-600 mb-6">
              Understand RTD Academy's mobile device expectations and how your phone plays a crucial role in maintaining exam security.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📋 General Mobile Device Expectations</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📵 During Regular Learning Time</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-2">Phones Off & Out of Reach:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Keep personal mobile devices (PMDs) silenced during study time</li>
                      <li>• Store phones out of view while engaging with course content</li>
                      <li>• Avoid the temptation to check messages during learning</li>
                      <li>• Focus entirely on your educational activities</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-2">No Social Media Access:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• RTD platforms block social media domains for students</li>
                      <li>• Students may not bypass these controls or restrictions</li>
                      <li>• Focus on course-related websites and resources only</li>
                      <li>• Use break times for personal internet browsing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">🎥 Recording Restrictions</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-orange-700 mb-2">No Unauthorized Recording:</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      Audio or video recording of live sessions on a mobile device is forbidden unless the teacher grants prior permission.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Always ask instructor permission first</li>
                      <li>• Respect if permission is denied</li>
                      <li>• Follow any conditions set for recording</li>
                      <li>• Never record other students without consent</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-100 rounded p-2">
                    <p className="text-xs text-orange-800 font-medium">
                      ⚖️ Unauthorized recording may violate privacy laws and school policies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🔒 Required Use for Exam Security</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">📹 Secondary Camera Requirement</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    During quizzes and section exams, your mobile device becomes an essential security tool. 
                    Teachers will require you to use your phone as a secondary camera to monitor your workspace.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700 mb-2">Why Secondary Camera?</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Provides complete view of your testing environment</li>
                      <li>• Shows your hands, keyboard, and workspace clearly</li>
                      <li>• Prevents use of unauthorized materials or devices</li>
                      <li>• Maintains academic integrity for all students</li>
                      <li>• Ensures fair testing conditions</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📐 Proper Phone Positioning</h4>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-2">
                      <h6 className="font-semibold text-xs text-blue-700">Camera Must Show:</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Your hands and keyboard</li>
                        <li>• Any notes or materials on your desk</li>
                        <li>• Your immediate workspace surroundings</li>
                        <li>• Calculator (if permitted for the exam)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded p-2">
                      <h6 className="font-semibold text-xs text-blue-700">Camera Should NOT Show:</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Personal or private areas of your home</li>
                        <li>• Other people in your household</li>
                        <li>• Confidential family information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">⚠️ Critical Setup Requirements</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">Device Configuration:</h5>
                      <ol className="text-xs text-gray-600 space-y-1">
                        <li>1. <strong>Join approved platform only:</strong> Usually Teams "second device" call</li>
                        <li>2. <strong>Set to Do Not Disturb:</strong> Turn off all notifications</li>
                        <li>3. <strong>Close all other apps:</strong> Only proctoring app should be open</li>
                        <li>4. <strong>Position camera correctly:</strong> Follow instructor guidance</li>
                      </ol>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">Violation Consequences:</h5>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Any deviation invalidates the attempt and may result in a mark of zero:</strong>
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Unlocking phone during exam</li>
                        <li>• Switching to other apps</li>
                        <li>• Muting or turning off camera</li>
                        <li>• Repositioning phone without permission</li>
                        <li>• Using phone for anything other than proctoring</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">🔧 Technical Preparation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>• Test your setup:</strong> Practice joining Teams meetings with your phone</li>
                    <li><strong>• Check battery level:</strong> Ensure phone is charged for entire exam duration</li>
                    <li><strong>• Stable internet:</strong> Both devices need reliable connection</li>
                    <li><strong>• Have backup plan:</strong> Know who to contact for technical issues</li>
                    <li><strong>• Clear storage:</strong> Ensure phone has space for video call</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📝 Step-by-Step Exam Setup Guide</h3>
            
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">🔄 Before Your Exam</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-orange-700 mb-2">Computer Setup:</h5>
                    <ol className="text-xs text-gray-600 space-y-1">
                      <li>1. Join main exam session on computer</li>
                      <li>2. Have your student ID ready</li>
                      <li>3. Close all unnecessary applications</li>
                      <li>4. Test audio and video</li>
                      <li>5. Position main camera to show your face</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-orange-700 mb-2">Phone Setup:</h5>
                    <ol className="text-xs text-gray-600 space-y-1">
                      <li>1. Set phone to Do Not Disturb</li>
                      <li>2. Close all apps except Teams</li>
                      <li>3. Join secondary device call</li>
                      <li>4. Position to show workspace</li>
                      <li>5. DO NOT touch phone once positioned</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">✅ During Your Exam</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold mb-2">What You CAN Do:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Focus on your exam questions</li>
                      <li>• Use allowed materials (calculator, etc.)</li>
                      <li>• Raise hand to ask questions</li>
                      <li>• Take breaks if permitted</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">What You CANNOT Do:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Touch or move your phone</li>
                      <li>• Check messages or notifications</li>
                      <li>• Leave the camera view</li>
                      <li>• Use unauthorized materials</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">If You Have Problems:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Raise hand on main camera</li>
                      <li>• Use chat function if available</li>
                      <li>• Wait for instructor guidance</li>
                      <li>• Do NOT fix technical issues yourself</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚖️ Policy Details & Exceptions</h3>
            <p className="text-yellow-700 text-sm mb-4">
              For complete details on the cell phone policy, including exceptions and enforcement procedures, 
              please refer to the official policy at rtdacademy.com/policies.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Possible Exceptions:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Medical emergency situations</li>
                  <li>• Technical difficulties with primary device</li>
                  <li>• Accommodation requirements (with prior approval)</li>
                  <li>• Instructor-directed use for educational purposes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Remember:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• These policies ensure fair testing for everyone</li>
                  <li>• They protect academic integrity</li>
                  <li>• Following them shows your professionalism</li>
                  <li>• When in doubt, ask before acting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Real-World Scenarios Section */}
      {activeSection === 'scenarios' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎭 Real-World Digital Citizenship Scenarios</h2>
            <p className="text-gray-600 mb-6">
              Practice applying digital citizenship principles to realistic situations you might encounter as an RTD Academy student.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🤔 Scenario-Based Learning</h3>
            <p className="text-gray-600 mb-4">
              For each scenario below, choose the best response that demonstrates good digital citizenship:
            </p>
            
            <div className="space-y-6">
              {/* Scenario 1 */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold mb-3">Scenario 1: Group Chat Gone Wrong</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        You're in a study group chat for Math 30-1 with several classmates. One student, Alex, starts making fun 
                        of another classmate, Jordan, saying their questions in the discussion forum are "stupid" and that they're 
                        "obviously not smart enough for this course." Other students begin laughing and adding their own negative comments. 
                        Jordan is not in this group chat.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        {
                          id: 'scenario1_a',
                          text: 'Join in with the jokes to fit in with the group',
                          feedback: '❌ This perpetuates cyberbullying and creates a toxic environment. Even if you\'re trying to fit in, participating in harassment is never acceptable.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario1_b', 
                          text: 'Say nothing and hope it stops on its own',
                          feedback: '⚠️ While staying silent isn\'t the worst choice, it allows the bullying to continue. Bystanders have a responsibility to help stop harassment.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario1_c',
                          text: 'Defend Jordan and remind the group about respectful communication, then report the incident',
                          feedback: '✅ Excellent response! You\'re being an upstander by defending Jordan and addressing the behavior directly. Reporting ensures proper intervention.',
                          isCorrect: true
                        },
                        {
                          id: 'scenario1_d',
                          text: 'Screenshot the messages and share them with other students to show how mean Alex is',
                          feedback: '❌ This spreads the harmful content further and could constitute bullying Alex. The proper response is to report to school authorities, not spread gossip.',
                          isCorrect: false
                        }
                      ].map((option) => (
                        <div key={option.id} className="space-y-2">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="scenario1"
                              value={option.id}
                              onChange={() => handleScenarioAnswer('scenario1', option.id)}
                              className="mt-1 text-purple-600"
                            />
                            <span className="text-sm font-medium">{option.text}</span>
                          </label>
                          
                          {scenarioAnswers.scenario1 === option.id && (
                            <div className={`ml-6 p-3 rounded-lg text-sm ${
                              option.isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {option.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 2 */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📸</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold mb-3">Scenario 2: Social Media and School Image</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        You're frustrated because you received a lower grade than expected on your Physics 30 assignment. You're considering 
                        posting on Instagram: "RTD Academy is such a joke! My teacher obviously doesn't know what they're doing. This school 
                        is a waste of money and I'm telling everyone not to go here! #RTDAcademySucks #WorstSchoolEver"
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        {
                          id: 'scenario2_a',
                          text: 'Post the message as planned - you have the right to express your opinions',
                          feedback: '❌ While you have free speech rights, this post could damage your digital footprint and school relationships. Public complaints rarely solve problems.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario2_b',
                          text: 'Take time to cool down, then speak directly with your instructor about your concerns',
                          feedback: '✅ Perfect approach! Taking time to process emotions and then addressing concerns professionally is mature and more likely to result in positive outcomes.',
                          isCorrect: true
                        },
                        {
                          id: 'scenario2_c',
                          text: 'Post the message but make your account private so only friends can see it',
                          feedback: '⚠️ Private posts can still become public through screenshots or friend sharing. This doesn\'t solve the underlying issue with your grade either.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario2_d',
                          text: 'Create a fake anonymous account to post the complaint',
                          feedback: '❌ Creating fake accounts to post negative content is dishonest and could violate platform terms of service. Anonymous complaints are also less credible.',
                          isCorrect: false
                        }
                      ].map((option) => (
                        <div key={option.id} className="space-y-2">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="scenario2"
                              value={option.id}
                              onChange={() => handleScenarioAnswer('scenario2', option.id)}
                              className="mt-1 text-blue-600"
                            />
                            <span className="text-sm font-medium">{option.text}</span>
                          </label>
                          
                          {scenarioAnswers.scenario2 === option.id && (
                            <div className={`ml-6 p-3 rounded-lg text-sm ${
                              option.isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {option.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 3 */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold mb-3">Scenario 3: Sharing Login Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        Your best friend Taylor is also taking courses at RTD Academy but is struggling with the technology. They ask you: 
                        "Can I just use your login to see how the assignments are supposed to look? I can't figure out how to navigate the 
                        system and I'm getting really behind. I promise I won't submit anything as you - I just want to see the format."
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        {
                          id: 'scenario3_a',
                          text: 'Share your login since they promised not to submit anything and they\'re your best friend',
                          feedback: '❌ Sharing login credentials is never acceptable, even with close friends. This violates school policy and could compromise your academic record.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario3_b',
                          text: 'Decline to share your login but offer to help them contact IT support for navigation assistance',
                          feedback: '✅ Excellent! You\'re protecting your account security while still helping your friend get the support they need through proper channels.',
                          isCorrect: true
                        },
                        {
                          id: 'scenario3_c',
                          text: 'Offer to take screenshots of the assignment format and share those instead',
                          feedback: '⚠️ While better than sharing login details, sharing assignment materials might still violate academic policies. Directing them to official support is better.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario3_d',
                          text: 'Tell them to figure it out themselves since you don\'t want to get in trouble',
                          feedback: '⚠️ While protecting yourself is important, this response lacks empathy. Offering to help them find appropriate support would be better.',
                          isCorrect: false
                        }
                      ].map((option) => (
                        <div key={option.id} className="space-y-2">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="scenario3"
                              value={option.id}
                              onChange={() => handleScenarioAnswer('scenario3', option.id)}
                              className="mt-1 text-green-600"
                            />
                            <span className="text-sm font-medium">{option.text}</span>
                          </label>
                          
                          {scenarioAnswers.scenario3 === option.id && (
                            <div className={`ml-6 p-3 rounded-lg text-sm ${
                              option.isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {option.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 4 */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold mb-3">Scenario 4: Exam Proctoring Issue</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        You're in the middle of your Math 30-1 Section 2 exam. Your phone is set up as the secondary camera as required. 
                        Suddenly, you receive several urgent text messages from your family about a potential emergency. Your phone keeps 
                        buzzing with notifications, and you can see the preview messages on your lock screen indicating it might be serious.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        {
                          id: 'scenario4_a',
                          text: 'Quickly unlock your phone to check the messages since it might be an emergency',
                          feedback: '❌ Unlocking your phone during an exam automatically invalidates your attempt, even for emergencies. The proper procedure is to alert the proctor first.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario4_b',
                          text: 'Raise your hand to alert the proctor and explain the situation without touching your phone',
                          feedback: '✅ Perfect response! This follows proper exam procedures while addressing the potential emergency. The proctor can help determine appropriate next steps.',
                          isCorrect: true
                        },
                        {
                          id: 'scenario4_c',
                          text: 'Ignore the messages and continue with your exam since you can\'t touch your phone',
                          feedback: '⚠️ While following phone rules is important, a true emergency warrants alerting the proctor. They can help you handle the situation appropriately.',
                          isCorrect: false
                        },
                        {
                          id: 'scenario4_d',
                          text: 'Move your phone to stop the buzzing sound but don\'t unlock it',
                          feedback: '❌ Any movement of your phone during an exam can be considered a violation. Even well-intentioned adjustments should be done with proctor permission.',
                          isCorrect: false
                        }
                      ].map((option) => (
                        <div key={option.id} className="space-y-2">
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="scenario4"
                              value={option.id}
                              onChange={() => handleScenarioAnswer('scenario4', option.id)}
                              className="mt-1 text-orange-600"
                            />
                            <span className="text-sm font-medium">{option.text}</span>
                          </label>
                          
                          {scenarioAnswers.scenario4 === option.id && (
                            <div className={`ml-6 p-3 rounded-lg text-sm ${
                              option.isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {option.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            {Object.keys(scenarioAnswers).length === 4 && (
              <div className="mt-8 p-6 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="text-lg font-semibold text-teal-800 mb-3">🎯 Scenario Assessment Complete!</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-2">Your Understanding:</h5>
                    <p className="text-sm text-gray-700">
                      You've worked through realistic scenarios that test your understanding of digital citizenship principles. 
                      These situations demonstrate the complexity of online interactions and the importance of making thoughtful decisions.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Key Takeaways:</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Stand up against cyberbullying and harassment</li>
                      <li>• Think before posting emotional responses</li>
                      <li>• Never share login credentials, even with friends</li>
                      <li>• Follow exam procedures even in difficult situations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Personal Reflection Section */}
      {activeSection === 'reflection' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🤔 Personal Digital Citizenship Reflection</h2>
            <p className="text-gray-600 mb-6">
              Reflect on your current online habits and commit to making positive changes to your digital citizenship practices.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">💭 AI-Powered Reflection Assistant</h3>
            
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-indigo-800 mb-4">✨ Guided Reflection Question</h4>
                <p className="text-gray-700 mb-4">
                  Based on everything you've learned about digital citizenship, online conduct, and personal responsibility:
                </p>
                
                <div className="bg-white rounded-lg border-2 border-indigo-200 p-4">
                  <p className="font-semibold text-indigo-900 mb-3">
                    What one change will you make to your online habits to become a better digital citizen?
                  </p>
                  
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-lg"
                    rows="6"
                    placeholder="Be specific about what you will change and how you will implement this change. Consider your current online behavior and identify one concrete improvement you can make..."
                    value={reflectionInput}
                    onChange={(e) => handleReflectionChange(e.target.value)}
                  />
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {reflectionInput.length}/500 characters (aim for at least 50 characters for feedback)
                  </div>
                </div>
              </div>

              {showAIReflection && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Reflection Analysis
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2 text-green-700">Reflection Quality Assessment:</h5>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Specificity:</strong> Your reflection shows thoughtful consideration of concrete changes you can make.</p>
                        <p><strong>Self-Awareness:</strong> You've demonstrated understanding of how your current habits might need improvement.</p>
                        <p><strong>Actionability:</strong> The change you've identified is something you can realistically implement.</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2 text-blue-700">Encouragement & Tips:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Small, consistent changes often have the biggest impact</li>
                        <li>• Consider sharing your commitment with a trusted friend or family member</li>
                        <li>• Set reminders to check in on your progress weekly</li>
                        <li>• Remember that digital citizenship is an ongoing practice, not a one-time decision</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2 text-yellow-700">Implementation Strategy:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Start implementing your change this week</li>
                        <li>• Track your progress for the next month</li>
                        <li>• Be patient with yourself as you develop new habits</li>
                        <li>• Adjust your approach if you find barriers or challenges</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">📋 Digital Citizenship Commitment Tracker</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-sm mb-3">Week 1-2: Foundation Building</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Implement my identified change</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Review my social media privacy settings</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Practice professional communication in one interaction</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Google my name to check my digital footprint</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-3">Week 3-4: Reinforcement & Growth</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Evaluate progress on my main change</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Help a classmate with a digital citizenship issue</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Create one piece of positive online content</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Reflect on what I've learned and plan next steps</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📚 Digital Citizenship Resources</h3>
            <p className="text-gray-600 mb-4">
              Continue your digital citizenship journey with these helpful resources:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">🌟 Positive Role Models</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Professional Communicators</h5>
                    <p className="text-xs text-gray-600">Notice how professionals in your field communicate online</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Educational Content Creators</h5>
                    <p className="text-xs text-gray-600">Follow accounts that share knowledge respectfully and inclusively</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Digital Rights Advocates</h5>
                    <p className="text-xs text-gray-600">Learn from those who promote responsible technology use</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🔧 Practical Tools</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Privacy Settings Guides</h5>
                    <p className="text-xs text-gray-600">Regular updates on how to protect your information</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Digital Wellness Apps</h5>
                    <p className="text-xs text-gray-600">Tools to monitor and improve your online habits</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Fact-Checking Resources</h5>
                    <p className="text-xs text-gray-600">Verify information before sharing it with others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-teal-800">🎯 Your Digital Citizenship Pledge</h3>
            <p className="text-teal-700 text-sm mb-4">
              Make a commitment to yourself and your learning community:
            </p>
            
            <div className="bg-white rounded-lg p-4 border-2 border-teal-300">
              <p className="text-gray-700 text-sm mb-4">
                <strong>I pledge to be a responsible digital citizen by:</strong>
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Treating all online interactions with respect and kindness</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Protecting my privacy and respecting others' privacy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Thinking carefully before posting or sharing content</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Standing up against cyberbullying and harassment</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Following RTD Academy's digital citizenship policies</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Communicating professionally in all educational settings</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Continuing to learn and improve my digital citizenship skills</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-teal-600" />
                    <span className="text-sm">Being a positive role model for other online learners</span>
                  </label>
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
            <h2 className="text-3xl font-bold mb-4">🎯 Digital Citizenship Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of digital citizenship principles, online conduct expectations, and RTD Academy's policies.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="04_conduct_expectations_responsibilities_practice"
            cloudFunctionName="course4_04_conduct_expectations_responsibilities_aiQuestion"
            title="Digital Citizenship & Online Conduct"
            theme="teal"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 You're Ready to Be a Digital Leader!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
            <ul className="space-y-2 text-teal-100">
              <li>✅ The five pillars of digital citizenship at RTD Academy</li>
              <li>✅ Professional online communication standards and etiquette</li>
              <li>✅ Privacy protection and security best practices</li>
              <li>✅ Digital footprint awareness and management strategies</li>
              <li>✅ Cyberbullying prevention and response procedures</li>
              <li>✅ Mobile device policy and exam security requirements</li>
              <li>✅ Real-world application of digital citizenship principles</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Next Actions:</h3>
            <div className="space-y-2 text-teal-100">
              <p>1. 📱 Implement the personal change you identified in your reflection</p>
              <p>2. 🔒 Review and update your privacy settings on all social media accounts</p>
              <p>3. 🤝 Practice professional communication in your next instructor email</p>
              <p>4. 👀 Be an upstander if you witness cyberbullying or inappropriate behavior</p>
              <p>5. 📋 Save contact information for reporting digital citizenship concerns</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Remember: Digital citizenship isn't just about following rules—it's about creating a positive, 
            safe, and respectful online learning community where everyone can thrive and succeed!
          </p>
        </div>
      </section>
    </div>
  );
};

export default ConductExpectationsAlbertaEducationResponsibilities;