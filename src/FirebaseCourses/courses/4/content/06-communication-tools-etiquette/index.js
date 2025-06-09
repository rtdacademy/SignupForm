import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const CommunicationToolsEtiquette = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [emailBuilder, setEmailBuilder] = useState({
    greeting: '',
    bodyStatements: [],
    signOff: '',
    completed: false,
    score: 0
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [etiquetteQuizAnswers, setEtiquetteQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Professional Email Builder Components
  const emailComponents = {
    greetings: [
      { id: 'greeting1', text: 'Dear Professor [Name],', appropriate: true, category: 'greeting' },
      { id: 'greeting2', text: 'Hello [Instructor Name],', appropriate: true, category: 'greeting' },
      { id: 'greeting3', text: 'Good morning/afternoon,', appropriate: true, category: 'greeting' },
      { id: 'greeting4', text: 'Hey!', appropriate: false, category: 'greeting' },
      { id: 'greeting5', text: 'Yo teach,', appropriate: false, category: 'greeting' },
      { id: 'greeting6', text: 'Hi there,', appropriate: false, category: 'greeting' }
    ],
    bodyStatements: [
      { id: 'body1', text: 'I hope this email finds you well.', appropriate: true, category: 'body' },
      { id: 'body2', text: 'I am writing to request clarification on the assignment requirements for Unit 3.', appropriate: true, category: 'body' },
      { id: 'body3', text: 'Could you please provide guidance on the deadline extension policy?', appropriate: true, category: 'body' },
      { id: 'body4', text: 'I would appreciate your assistance with understanding the assessment criteria.', appropriate: true, category: 'body' },
      { id: 'body5', text: 'Could we schedule a virtual meeting to discuss my progress?', appropriate: true, category: 'body' },
      { id: 'body6', text: 'need help ASAP!!!', appropriate: false, category: 'body' },
      { id: 'body7', text: 'this assignment is impossible can you just give me the answers', appropriate: false, category: 'body' },
      { id: 'body8', text: 'why is this course so hard??', appropriate: false, category: 'body' },
      { id: 'body9', text: 'can u help me rn', appropriate: false, category: 'body' }
    ],
    signOffs: [
      { id: 'signoff1', text: 'Best regards,\n[Your Full Name]\n[Student ID]', appropriate: true, category: 'signoff' },
      { id: 'signoff2', text: 'Sincerely,\n[Your Name]', appropriate: true, category: 'signoff' },
      { id: 'signoff3', text: 'Thank you for your time,\n[Your Name]', appropriate: true, category: 'signoff' },
      { id: 'signoff4', text: 'Respectfully,\n[Your Full Name]', appropriate: true, category: 'signoff' },
      { id: 'signoff5', text: 'thx\n-me', appropriate: false, category: 'signoff' },
      { id: 'signoff6', text: 'TTYL', appropriate: false, category: 'signoff' },
      { id: 'signoff7', text: 'xoxo', appropriate: false, category: 'signoff' }
    ]
  };

  // Communication Quiz Questions
  const etiquetteQuestions = [
    {
      id: 'q1',
      question: 'What is the appropriate response time expectation for instructor emails during business hours?',
      options: [
        'Within 5 minutes',
        'Within 24-48 hours',
        'Within 1 week',
        'Immediately'
      ],
      correct: 1,
      explanation: 'Instructors typically respond within 24-48 hours during business days. Immediate responses should not be expected.'
    },
    {
      id: 'q2',
      question: 'During a virtual meeting, when should you mute your microphone?',
      options: [
        'Only when eating',
        'When not actively speaking',
        'Never - others need to hear background noise',
        'Only during presentations'
      ],
      correct: 1,
      explanation: 'You should mute your microphone when not actively speaking to prevent background noise from disrupting the meeting.'
    },
    {
      id: 'q3',
      question: 'What type of username is most appropriate for RTD Academy communications?',
      options: [
        'coolstudent2024',
        'john.smith.student',
        'partyanimal_99',
        'studybuddy_lol'
      ],
      correct: 1,
      explanation: 'Professional usernames using your real name (like john.smith.student) are most appropriate for academic communications.'
    },
    {
      id: 'q4',
      question: 'Which camera position is best for virtual meetings?',
      options: [
        'Below your face looking up',
        'At eye level with good lighting',
        'High above looking down',
        'Camera off is always better'
      ],
      correct: 1,
      explanation: 'Camera should be at eye level with good lighting for professional appearance and effective communication.'
    },
    {
      id: 'q5',
      question: 'How should you address technical difficulties during a virtual exam?',
      options: [
        'Post about it on social media',
        'Text your classmates for help',
        'Contact technical support immediately',
        'Just wait and hope it fixes itself'
      ],
      correct: 2,
      explanation: 'Technical difficulties during exams should be reported to technical support immediately to ensure proper documentation and assistance.'
    }
  ];

  // Drag and Drop Functions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    if (draggedItem && draggedItem.category === dropZone) {
      setEmailBuilder(prev => ({
        ...prev,
        [dropZone === 'greeting' ? 'greeting' : 
         dropZone === 'body' ? 'bodyStatements' : 'signOff']: 
         dropZone === 'body' 
           ? [...prev.bodyStatements, draggedItem]
           : draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const removeFromEmail = (category, itemId = null) => {
    setEmailBuilder(prev => ({
      ...prev,
      [category === 'greeting' ? 'greeting' :
       category === 'body' ? 'bodyStatements' : 'signOff']:
       category === 'body' 
         ? prev.bodyStatements.filter(item => item.id !== itemId)
         : ''
    }));
  };

  const checkEmailBuilder = () => {
    let score = 0;
    let feedback = [];

    // Check greeting
    if (emailBuilder.greeting && emailBuilder.greeting.appropriate) {
      score += 1;
      feedback.push('✅ Professional greeting selected');
    } else if (emailBuilder.greeting) {
      feedback.push('❌ Greeting too casual for academic communication');
    } else {
      feedback.push('❌ No greeting selected');
    }

    // Check body statements
    const appropriateBodyCount = emailBuilder.bodyStatements.filter(stmt => stmt.appropriate).length;
    const inappropriateBodyCount = emailBuilder.bodyStatements.filter(stmt => !stmt.appropriate).length;
    
    if (appropriateBodyCount >= 2 && inappropriateBodyCount === 0) {
      score += 2;
      feedback.push('✅ Professional body content selected');
    } else if (appropriateBodyCount >= 1 && inappropriateBodyCount === 0) {
      score += 1;
      feedback.push('⚠️ Good body content, but could be more comprehensive');
    } else if (inappropriateBodyCount > 0) {
      feedback.push('❌ Some body content is too casual or inappropriate');
    } else {
      feedback.push('❌ No body content selected');
    }

    // Check sign-off
    if (emailBuilder.signOff && emailBuilder.signOff.appropriate) {
      score += 1;
      feedback.push('✅ Professional sign-off selected');
    } else if (emailBuilder.signOff) {
      feedback.push('❌ Sign-off too casual for academic communication');
    } else {
      feedback.push('❌ No sign-off selected');
    }

    setEmailBuilder(prev => ({
      ...prev,
      completed: true,
      score: score,
      feedback: feedback
    }));
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    setEtiquetteQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
  };

  const getQuizScore = () => {
    let correct = 0;
    etiquetteQuestions.forEach(q => {
      if (etiquetteQuizAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    return { correct, total: etiquetteQuestions.length };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Communication Tools & Etiquette</h1>
        <p className="text-xl mb-6">Master professional digital communication in your academic environment</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Learn appropriate use of Teams and LMS messaging, understand professional 
            communication standards, develop skills for virtual meetings and email etiquette, and practice RTD Academy's 
            digital communication expectations.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Communication Overview' },
            { id: 'tools', label: 'RTD Communication Tools' },
            { id: 'professional', label: 'Professional vs Social' },
            { id: 'meetings', label: 'Virtual Meeting Etiquette' },
            { id: 'email', label: 'Email Best Practices' },
            { id: 'builder', label: 'Email Builder Activity' },
            { id: 'quiz', label: 'Communication Quiz' },
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

      {/* Communication Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">💬 The Importance of Professional Communication</h2>
            <p className="text-gray-700 mb-4">
              Effective digital communication is crucial for your success at RTD Academy. Unlike casual social interactions, 
              academic communication requires professionalism, clarity, and respect for institutional protocols.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Benefits of Professional Communication</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-800">Builds Credibility</h4>
                  <p className="text-sm text-gray-600">Professional communication demonstrates maturity and seriousness about your education.</p>
                </div>
                
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-800">Improves Response Quality</h4>
                  <p className="text-sm text-gray-600">Clear, respectful messages receive more helpful and timely responses.</p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-purple-800">Develops Career Skills</h4>
                  <p className="text-sm text-gray-600">Academic communication skills transfer directly to workplace success.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-800">Creates Positive Relationships</h4>
                  <p className="text-sm text-gray-600">Respectful communication builds trust and rapport with instructors and peers.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">⚠️ Communication Challenges in Online Learning</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Lack of Non-Verbal Cues</h4>
                  <p className="text-sm text-gray-700">
                    Online communication lacks body language and tone, making messages easier to misinterpret.
                  </p>
                  <p className="text-xs text-red-600 mt-1">Solution: Be extra clear and considerate in your written communication.</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Informal Habits</h4>
                  <p className="text-sm text-gray-700">
                    Social media and texting habits can accidentally carry over into academic communication.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Solution: Consciously switch to professional mode for academic platforms.</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Technology Barriers</h4>
                  <p className="text-sm text-gray-700">
                    Technical issues can disrupt communication and create frustration.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">Solution: Have backup communication methods and report issues promptly.</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Time Zone Confusion</h4>
                  <p className="text-sm text-gray-700">
                    Asynchronous communication can create delays and scheduling misunderstandings.
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Solution: Be clear about deadlines and response time expectations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🎯 RTD Academy Communication Goals</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold mb-1">Respectful Interaction</h4>
                <p className="text-gray-600">Maintain professionalism in all communications</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">💡</div>
                <h4 className="font-semibold mb-1">Clear Communication</h4>
                <p className="text-gray-600">Express ideas clearly and concisely</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-semibold mb-1">Timely Response</h4>
                <p className="text-gray-600">Respond appropriately within expected timeframes</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RTD Communication Tools Section */}
      {activeSection === 'tools' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🛠️ RTD Academy Communication Tools</h2>
            <p className="text-gray-600 mb-6">
              Understanding when and how to use each communication platform appropriately.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Teams Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Microsoft Teams</h3>
                  <p className="text-gray-600 text-sm">Virtual meetings and real-time collaboration</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Primary Uses:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Virtual office hours with instructors</li>
                    <li>• Live lessons and presentations</li>
                    <li>• Group study sessions</li>
                    <li>• Exam proctoring (secondary camera setup)</li>
                    <li>• Real-time Q&A during sessions</li>
                    <li>• File sharing during meetings</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">Communication Features:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Chat messages during meetings</li>
                    <li>• Voice and video calls</li>
                    <li>• Screen sharing capabilities</li>
                    <li>• Breakout rooms for group work</li>
                    <li>• Recording functionality (when permitted)</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm"><strong>💡 Best Practice:</strong> Join Teams meetings 2-3 minutes early to test your audio/video setup.</p>
                </div>
              </div>
            </div>

            {/* LMS Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Learning Management System (LMS)</h3>
                  <p className="text-gray-600 text-sm">Course content and messaging platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">Primary Uses:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Accessing course materials and lessons</li>
                    <li>• Submitting assignments and projects</li>
                    <li>• Viewing grades and feedback</li>
                    <li>• Participating in discussion forums</li>
                    <li>• Messaging instructors directly</li>
                    <li>• Downloading course resources</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Messaging Guidelines:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Use for course-related questions</li>
                    <li>• Include clear subject lines</li>
                    <li>• Attach relevant files when needed</li>
                    <li>• Check for instructor response timeframes</li>
                    <li>• Use formal language and proper grammar</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm"><strong>💡 Best Practice:</strong> Check your LMS messages daily during active course periods.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📧 Email Communication</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">When to Use Email:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Detailed questions requiring explanation</li>
                    <li>• Formal requests (extensions, accommodations)</li>
                    <li>• Sharing documents or external links</li>
                    <li>• Following up on previous conversations</li>
                    <li>• Scheduling meetings or appointments</li>
                    <li>• Reporting technical issues</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Response Time Expectations:</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Student to Instructor:</strong> Allow 24-48 hours for response</p>
                    <p><strong>Urgent Issues:</strong> Use "URGENT" in subject line and follow up if needed</p>
                    <p><strong>Weekends/Holidays:</strong> Expect delays in responses</p>
                    <p><strong>Technical Support:</strong> Contact IT support for immediate technical issues</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">📋 Quick Communication Reference</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">Quick Question</span>
                      <span className="text-blue-600">LMS Message</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">Live Discussion</span>
                      <span className="text-green-600">Teams Chat</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">Formal Request</span>
                      <span className="text-purple-600">Email</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">Technical Issue</span>
                      <span className="text-orange-600">Email + Phone</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">Group Work</span>
                      <span className="text-indigo-600">Teams Channel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-red-800">🚫 Communication Channels to Avoid</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Never Use for Academic Communication:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Personal social media (Instagram, Snapchat, TikTok)</li>
                  <li>• Text messages to instructors' personal phones</li>
                  <li>• Gaming platforms or chat applications</li>
                  <li>• Public social media posts about course issues</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Why These Channels Are Inappropriate:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Lack professional documentation</li>
                  <li>• May violate privacy policies</li>
                  <li>• Could be missed or ignored</li>
                  <li>• Don't maintain academic boundaries</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Professional vs Social Communication Section */}
      {activeSection === 'professional' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎭 Professional vs Social Communication</h2>
            <p className="text-gray-600 mb-6">
              Understanding the critical differences between academic and casual communication styles.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📊 Side-by-Side Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Communication Aspect</th>
                    <th className="text-left py-3 px-4 font-semibold text-red-600">❌ Social Media Style</th>
                    <th className="text-left py-3 px-4 font-semibold text-green-600">✅ Professional Academic Style</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Greeting</td>
                    <td className="py-3 px-4 text-red-700">"hey" "hi there" "sup"</td>
                    <td className="py-3 px-4 text-green-700">"Dear Professor Smith" "Hello Dr. Johnson"</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Tone</td>
                    <td className="py-3 px-4 text-red-700">Casual, informal, sometimes demanding</td>
                    <td className="py-3 px-4 text-green-700">Respectful, courteous, professional</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Language</td>
                    <td className="py-3 px-4 text-red-700">Abbreviations: "u", "ur", "thx", "lol"</td>
                    <td className="py-3 px-4 text-green-700">Complete words: "you", "your", "thank you"</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Punctuation</td>
                    <td className="py-3 px-4 text-red-700">Multiple punctuation: "???" "!!!"</td>
                    <td className="py-3 px-4 text-green-700">Standard punctuation and capitalization</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Urgency</td>
                    <td className="py-3 px-4 text-red-700">"ASAP" "need this now" "urgent!!!"</td>
                    <td className="py-3 px-4 text-green-700">"At your earliest convenience" "When possible"</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Sign-off</td>
                    <td className="py-3 px-4 text-red-700">"ttyl" "thx" "xoxo"</td>
                    <td className="py-3 px-4 text-green-700">"Best regards" "Sincerely" "Thank you"</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Emojis</td>
                    <td className="py-3 px-4 text-red-700">Frequent use: 😂🔥💯</td>
                    <td className="py-3 px-4 text-green-700">Minimal or no emoji use in formal communication</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-red-800">❌ Examples of Inappropriate Academic Communication</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-sm mb-2">Poor Email Example:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <p>hey prof!</p>
                    <p>cant figure out this assignment can u just tell me the answers lol. need this asap for my grade!!!</p>
                    <p>thx</p>
                    <p>-student123</p>
                  </div>
                  <div className="mt-2 text-xs text-red-600">
                    <strong>Issues:</strong> Casual greeting, poor grammar, demanding tone, inappropriate request, unprofessional sign-off
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-sm mb-2">Poor Teams Message:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <p>yo teach!! where r u? meeting started 5 min ago and ur not here!!! 😡</p>
                  </div>
                  <div className="mt-2 text-xs text-red-600">
                    <strong>Issues:</strong> Disrespectful greeting, accusatory tone, inappropriate emojis, lack of understanding
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">✅ Examples of Professional Academic Communication</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-sm mb-2">Professional Email Example:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <p>Dear Professor Johnson,</p>
                    <p>I hope this email finds you well. I am writing to request clarification on the requirements for Assignment 3, specifically regarding the citation format expected.</p>
                    <p>I have reviewed the course materials but would appreciate additional guidance on the APA formatting requirements.</p>
                    <p>Thank you for your time and assistance.</p>
                    <p>Best regards,</p>
                    <p>Sarah Smith</p>
                    <p>Student ID: 12345678</p>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    <strong>Strengths:</strong> Professional greeting, clear purpose, specific question, respectful tone, proper identification
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-sm mb-2">Professional Teams Message:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <p>Good afternoon, Professor Johnson. I'm having difficulty accessing today's virtual meeting. Could you please confirm the meeting link? Thank you.</p>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    <strong>Strengths:</strong> Polite greeting, clear problem statement, specific request, professional tone
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">🎯 Code-Switching: Adapting Your Communication Style</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Why Code-Switching Matters:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Shows respect for the academic environment</li>
                  <li>• Demonstrates professional maturity</li>
                  <li>• Improves the quality of responses you receive</li>
                  <li>• Prepares you for workplace communication</li>
                  <li>• Builds positive relationships with instructors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Successful Code-Switching:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Pause before writing to consider your audience</li>
                  <li>• Proofread messages before sending</li>
                  <li>• Use spell-check and grammar tools</li>
                  <li>• Practice formal writing regularly</li>
                  <li>• Ask for feedback on your communication style</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Virtual Meeting Etiquette Section */}
      {activeSection === 'meetings' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎥 Virtual Meeting Etiquette</h2>
            <p className="text-gray-600 mb-6">
              Master the art of professional virtual meetings with proper camera setup, participation, and digital presence.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📹 Camera and Video Best Practices</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">✅ Optimal Camera Setup</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <div>
                        <p className="font-medium text-sm">Eye-Level Position</p>
                        <p className="text-xs text-gray-600">Camera should be at eye level to create natural eye contact and professional appearance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <div>
                        <p className="font-medium text-sm">Good Lighting</p>
                        <p className="text-xs text-gray-600">Face a window or use a lamp to ensure your face is well-lit and clearly visible</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <div>
                        <p className="font-medium text-sm">Stable Connection</p>
                        <p className="text-xs text-gray-600">Test your internet connection and close unnecessary applications</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <div>
                        <p className="font-medium text-sm">Clean Background</p>
                        <p className="text-xs text-gray-600">Choose a neat, professional background or use appropriate virtual backgrounds</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Camera Setup Mistakes to Avoid</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Camera pointing up from below (unflattering angle)</li>
                    <li>• Sitting with bright light behind you (creates silhouette)</li>
                    <li>• Messy or distracting background</li>
                    <li>• Camera too close or too far away</li>
                    <li>• Poor audio quality or echo</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🎤 Audio and Microphone Guidelines</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Mute When Not Speaking:</strong> Always mute your microphone when you're not actively participating to prevent background noise.</p>
                    <p><strong>Use Headphones:</strong> Headphones or earbuds reduce echo and improve audio quality for everyone.</p>
                    <p><strong>Speak Clearly:</strong> Speak at a normal pace and volume, directly toward your microphone.</p>
                    <p><strong>Test Audio First:</strong> Join meetings early to test your audio settings and resolve any issues.</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">👔 Professional Appearance</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Appropriate Attire:</strong> Dress as you would for an in-person class - neat, clean, and covering your upper and lower body.</p>
                    <p><strong>Face Visible:</strong> Keep your face uncovered and clearly visible during exams and important discussions.</p>
                    <p><strong>Professional Posture:</strong> Sit up straight and maintain engagement through body language.</p>
                    <p><strong>Minimize Distractions:</strong> Avoid eating, drinking loudly, or multitasking during meetings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🗣️ Participation and Communication During Meetings</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">💬 Speaking and Contributing</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>Raise Your Hand:</strong> Use the raise hand feature or wait for appropriate moments to speak</li>
                    <li><strong>Unmute Appropriately:</strong> Unmute only when you're ready to speak, then mute again when finished</li>
                    <li><strong>Be Concise:</strong> Keep comments focused and relevant to save time for everyone</li>
                    <li><strong>Use Chat Effectively:</strong> Use chat for questions that don't interrupt the flow</li>
                    <li><strong>Stay Engaged:</strong> Show attentiveness through nodding and appropriate responses</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⏰ Meeting Punctuality</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Join 2-3 minutes before the scheduled start time</li>
                    <li>• Test your technology beforehand</li>
                    <li>• Have backup plans for technical difficulties</li>
                    <li>• Stay for the entire duration unless excused</li>
                    <li>• Notify instructor if you must leave early</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔒 Exam Proctoring Protocols</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>Secondary Camera:</strong> Set up your phone or tablet to show your hands, keyboard, and workspace</li>
                    <li><strong>Do Not Disturb:</strong> Set all devices to Do Not Disturb mode</li>
                    <li><strong>Close All Apps:</strong> Only have the exam platform and proctoring tools open</li>
                    <li><strong>Follow Instructions:</strong> Listen carefully to all proctoring directions</li>
                    <li><strong>Report Issues:</strong> Immediately notify the instructor of any technical problems</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">🤝 Virtual Meeting Courtesy</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Be patient with technical difficulties</li>
                    <li>• Help classmates with basic tech issues when appropriate</li>
                    <li>• Respect others' speaking time</li>
                    <li>• Use professional language and tone</li>
                    <li>• Thank the instructor and participants at the end</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🎯 Professional Username Guidelines</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-100 rounded p-3">
                <h4 className="font-semibold text-green-800 mb-2">✅ Good Examples:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• sarah.smith.student</li>
                  <li>• j.doe.rtd</li>
                  <li>• alex.chen.2024</li>
                  <li>• firstname.lastname</li>
                </ul>
              </div>
              <div className="bg-red-100 rounded p-3">
                <h4 className="font-semibold text-red-800 mb-2">❌ Poor Examples:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• gamergirl2024</li>
                  <li>• partyanimal_99</li>
                  <li>• hottie4u</li>
                  <li>• coolguy_lol</li>
                </ul>
              </div>
              <div className="bg-blue-100 rounded p-3">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Use your real name</li>
                  <li>• Keep it simple</li>
                  <li>• Avoid numbers/symbols</li>
                  <li>• Match your email style</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email Best Practices Section */}
      {activeSection === 'email' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📧 Email Best Practices</h2>
            <p className="text-gray-600 mb-6">
              Master professional email communication with proper structure, tone, and formatting.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📝 Email Structure and Components</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📬 Subject Line Best Practices</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-green-700">✅ Effective Subject Lines:</p>
                      <ul className="text-xs text-gray-700 mt-1 space-y-1">
                        <li>• "Question about Assignment 3 - Physics 30"</li>
                        <li>• "Request for Meeting - Student ID 12345"</li>
                        <li>• "Technical Issue with LMS Access"</li>
                        <li>• "Extension Request - Math 30-1 Project"</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm text-red-700">❌ Poor Subject Lines:</p>
                      <ul className="text-xs text-gray-700 mt-1 space-y-1">
                        <li>• "help"</li>
                        <li>• "question"</li>
                        <li>• "urgent!!!"</li>
                        <li>• (no subject line)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">👋 Professional Greetings</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Formal Options:</strong></p>
                    <ul className="text-xs text-gray-700 ml-4 space-y-1">
                      <li>• Dear Professor [Last Name],</li>
                      <li>• Dear Dr. [Last Name],</li>
                      <li>• Hello [Title] [Last Name],</li>
                    </ul>
                    
                    <p><strong>Less Formal (when appropriate):</strong></p>
                    <ul className="text-xs text-gray-700 ml-4 space-y-1">
                      <li>• Good morning/afternoon,</li>
                      <li>• Hello [First Name], (if invited to use first name)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">✍️ Body Content Guidelines</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm mb-1">Opening Statement:</p>
                      <p className="text-xs text-gray-700">"I hope this email finds you well" or "I am writing to..."</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm mb-1">Main Content:</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Be specific and clear about your request</li>
                        <li>• Provide relevant context or background</li>
                        <li>• Include specific course and assignment details</li>
                        <li>• State what action you're requesting</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm mb-1">Closing:</p>
                      <p className="text-xs text-gray-700">"Thank you for your time" or "I appreciate your assistance"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">📝 Professional Sign-offs</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-green-700">✅ Appropriate:</p>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Best regards,</li>
                        <li>• Sincerely,</li>
                        <li>• Thank you,</li>
                        <li>• Respectfully,</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-red-700">❌ Inappropriate:</p>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Cheers,</li>
                        <li>• TTYL,</li>
                        <li>• xoxo,</li>
                        <li>• Peace out,</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📋 Email Checklist Before Sending</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold mb-3">Content Review:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Clear, specific subject line</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Professional greeting</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Clear purpose statement</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Specific details included</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Polite, respectful tone</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Professional sign-off</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold mb-3">Technical Review:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Spell-check completed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Grammar checked</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Correct recipient selected</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Attachments included (if needed)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Student ID included in signature</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-600" />
                    <span className="text-sm">Read once more before sending</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">✅ Complete Professional Email Example</h3>
              <div className="bg-white rounded-lg p-4 border">
                <div className="font-mono text-sm space-y-2">
                  <p><strong>Subject:</strong> Question about Assignment 2 Requirements - Physics 30</p>
                  <hr className="my-3" />
                  <p>Dear Professor Johnson,</p>
                  <p>I hope this email finds you well. I am writing to request clarification regarding the requirements for Assignment 2 in Physics 30.</p>
                  <p>Specifically, I would like clarification on whether we should include both theoretical explanations and practical examples for each concept, or if one approach is preferred.</p>
                  <p>I have reviewed the assignment guidelines and course materials, but I want to ensure I am meeting all expectations for this important assessment.</p>
                  <p>Thank you for your time and assistance. I look forward to your guidance.</p>
                  <p>Best regards,<br />
                  Sarah Smith<br />
                  Student ID: 12345678<br />
                  Physics 30, Section A</p>
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">This email demonstrates professional structure, clear communication, and appropriate academic tone.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Advanced Email Tips</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Response Time Management:</h4>
                  <p className="text-gray-700">If you need an urgent response, indicate this respectfully in the subject line and explain why urgency is needed.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Follow-up Protocol:</h4>
                  <p className="text-gray-700">Wait 48-72 hours before following up on non-urgent emails. When following up, reference your original email.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Attachment Etiquette:</h4>
                  <p className="text-gray-700">Always mention attachments in your email body and use clear, descriptive file names.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">CC and BCC Usage:</h4>
                  <p className="text-gray-700">Only CC people who need to see the conversation. Use BCC for group emails to protect privacy.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email Builder Activity Section */}
      {activeSection === 'builder' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🏗️ Interactive Email Builder Activity</h2>
            <p className="text-gray-600 mb-6">
              Practice building professional emails by selecting appropriate components. Drag and drop elements to create a complete, professional email.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">📝 Instructions</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">How to Complete:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>1. Drag appropriate greetings, body statements, and sign-offs</li>
                  <li>2. Drop them into the correct sections of the email</li>
                  <li>3. Build a complete, professional email</li>
                  <li>4. Click "Check My Email" to see your score</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Success Tips:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Choose professional language over casual</li>
                  <li>• Include 2-3 body statements for completeness</li>
                  <li>• Avoid informal abbreviations and slang</li>
                  <li>• Remember this is academic communication</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Email Components to Drag */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-700">📚 Email Components</h3>
                <p className="text-sm text-gray-600 mb-4">Drag these components to build your email →</p>
                
                <div className="space-y-4">
                  {/* Greetings */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Greetings:</h4>
                    <div className="space-y-2">
                      {emailComponents.greetings.map((greeting) => (
                        <div
                          key={greeting.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, greeting)}
                          className={`p-2 rounded border-2 border-dashed cursor-move text-sm ${
                            greeting.appropriate
                              ? 'bg-green-50 border-green-300 hover:bg-green-100'
                              : 'bg-red-50 border-red-300 hover:bg-red-100'
                          }`}
                        >
                          {greeting.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body Statements */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Body Statements:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {emailComponents.bodyStatements.map((body) => (
                        <div
                          key={body.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, body)}
                          className={`p-2 rounded border-2 border-dashed cursor-move text-sm ${
                            body.appropriate
                              ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                              : 'bg-red-50 border-red-300 hover:bg-red-100'
                          }`}
                        >
                          {body.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sign-offs */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Sign-offs:</h4>
                    <div className="space-y-2">
                      {emailComponents.signOffs.map((signoff) => (
                        <div
                          key={signoff.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, signoff)}
                          className={`p-2 rounded border-2 border-dashed cursor-move text-sm ${
                            signoff.appropriate
                              ? 'bg-purple-50 border-purple-300 hover:bg-purple-100'
                              : 'bg-red-50 border-red-300 hover:bg-red-100'
                          }`}
                        >
                          <pre className="text-xs">{signoff.text}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Builder */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-700">📧 Build Your Email</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                  {/* Email Header */}
                  <div className="bg-white rounded p-3 mb-4">
                    <p className="font-mono text-sm text-gray-600">To: professor.johnson@rtdacademy.com</p>
                    <p className="font-mono text-sm text-gray-600">Subject: Question about Course Requirements</p>
                  </div>

                  {/* Greeting Section */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'greeting')}
                    className={`mb-4 min-h-[50px] border-2 border-dashed rounded p-3 ${
                      emailBuilder.greeting
                        ? emailBuilder.greeting.appropriate
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {emailBuilder.greeting ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{emailBuilder.greeting.text}</span>
                        <button
                          onClick={() => removeFromEmail('greeting')}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Drop greeting here...</p>
                    )}
                  </div>

                  {/* Body Section */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'body')}
                    className="mb-4 min-h-[120px] border-2 border-dashed rounded p-3 bg-gray-100 border-gray-300"
                  >
                    {emailBuilder.bodyStatements.length > 0 ? (
                      <div className="space-y-2">
                        {emailBuilder.bodyStatements.map((statement, index) => (
                          <div
                            key={`${statement.id}-${index}`}
                            className={`flex items-start justify-between p-2 rounded text-sm ${
                              statement.appropriate ? 'bg-blue-50' : 'bg-red-50'
                            }`}
                          >
                            <span>{statement.text}</span>
                            <button
                              onClick={() => removeFromEmail('body', statement.id)}
                              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Drop body statements here...</p>
                    )}
                  </div>

                  {/* Sign-off Section */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'signoff')}
                    className={`min-h-[60px] border-2 border-dashed rounded p-3 ${
                      emailBuilder.signOff
                        ? emailBuilder.signOff.appropriate
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-red-50 border-red-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {emailBuilder.signOff ? (
                      <div className="flex items-start justify-between">
                        <pre className="text-sm">{emailBuilder.signOff.text}</pre>
                        <button
                          onClick={() => removeFromEmail('signoff')}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">Drop sign-off here...</p>
                    )}
                  </div>
                </div>

                {/* Check Button */}
                <div className="mt-4 text-center">
                  {!emailBuilder.completed ? (
                    <button
                      onClick={checkEmailBuilder}
                      disabled={!emailBuilder.greeting || emailBuilder.bodyStatements.length === 0 || !emailBuilder.signOff}
                      className={`px-6 py-3 rounded-lg font-medium ${
                        emailBuilder.greeting && emailBuilder.bodyStatements.length > 0 && emailBuilder.signOff
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🔍 Check My Email
                    </button>
                  ) : (
                    <div className={`inline-block p-4 rounded-lg ${
                      emailBuilder.score >= 3 ? 'bg-green-100' : emailBuilder.score >= 2 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <h4 className="font-bold text-lg mb-2">
                        {emailBuilder.score >= 3 ? '🎉 Excellent!' : emailBuilder.score >= 2 ? '👍 Good Job!' : '📚 Needs Improvement'}
                      </h4>
                      <p className="font-medium">Score: {emailBuilder.score}/4</p>
                      
                      <div className="mt-3 text-left text-sm">
                        {emailBuilder.feedback.map((item, index) => (
                          <p key={index} className="mb-1">{item}</p>
                        ))}
                      </div>

                      <button
                        onClick={() => setEmailBuilder({
                          greeting: '',
                          bodyStatements: [],
                          signOff: '',
                          completed: false,
                          score: 0
                        })}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        🔄 Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Communication Quiz Section */}
      {activeSection === 'quiz' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🧠 Communication Dos and Don'ts Quiz</h2>
            <p className="text-gray-600 mb-6">
              Test your knowledge of professional communication standards and etiquette rules.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">📋 Communication Knowledge Quiz</h3>
            
            <div className="space-y-6">
              {etiquetteQuestions.map((question, qIndex) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">
                    {qIndex + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = etiquetteQuizAnswers[question.id] === oIndex;
                      const isCorrect = oIndex === question.correct;
                      const showResults = showQuizResults;
                      
                      return (
                        <label
                          key={oIndex}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all ${
                            showResults
                              ? isCorrect
                                ? 'bg-green-100 border border-green-300'
                                : isSelected && !isCorrect
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-white'
                              : isSelected
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={isSelected}
                            onChange={() => handleQuizAnswer(question.id, oIndex)}
                            disabled={showQuizResults}
                            className="text-blue-600"
                          />
                          <span className={`text-sm ${
                            showResults && isCorrect ? 'font-semibold text-green-800' :
                            showResults && isSelected && !isCorrect ? 'text-red-800' : ''
                          }`}>
                            {option}
                            {showResults && isCorrect && <span className="ml-2">✅</span>}
                            {showResults && isSelected && !isCorrect && <span className="ml-2">❌</span>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  
                  {showQuizResults && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              {!showQuizResults ? (
                <button
                  onClick={checkQuizAnswers}
                  disabled={Object.keys(etiquetteQuizAnswers).length < etiquetteQuestions.length}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    Object.keys(etiquetteQuizAnswers).length >= etiquetteQuestions.length
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🔍 Check My Answers ({Object.keys(etiquetteQuizAnswers).length}/{etiquetteQuestions.length})
                </button>
              ) : (
                <div className={`inline-block p-4 rounded-lg ${
                  getQuizScore().correct >= 4 ? 'bg-green-100' :
                  getQuizScore().correct >= 3 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <h4 className="font-bold text-lg mb-2">
                    {getQuizScore().correct >= 4 ? '🎉 Excellent!' :
                     getQuizScore().correct >= 3 ? '👍 Good Job!' : '📚 Keep Learning!'}
                  </h4>
                  <p className="font-medium">
                    Score: {getQuizScore().correct}/{getQuizScore().total} ({Math.round((getQuizScore().correct/getQuizScore().total)*100)}%)
                  </p>
                  
                  <div className="mt-3 text-sm">
                    {getQuizScore().correct >= 4 && (
                      <p className="text-green-700">Outstanding! You have excellent understanding of professional communication standards.</p>
                    )}
                    {getQuizScore().correct === 3 && (
                      <p className="text-yellow-700">Good work! Review the explanations to strengthen your communication knowledge.</p>
                    )}
                    {getQuizScore().correct < 3 && (
                      <p className="text-red-700">Consider reviewing the lesson content and trying again to improve your understanding.</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setEtiquetteQuizAnswers({});
                      setShowQuizResults(false);
                    }}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    🔄 Try Again
                  </button>
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
            <h2 className="text-3xl font-bold mb-4">🎯 Advanced Communication Assessment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Apply your knowledge of professional communication tools and etiquette in advanced scenarios.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="06_communication_tools_etiquette_practice"
            cloudFunctionName="course4_06_communication_tools_etiquette_aiQuestion"
            title="Professional Communication Mastery"
            theme="blue"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! You're Now a Communication Pro</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Communication Skills Mastered:</h3>
            <ul className="space-y-2 text-blue-100">
              <li>✅ Professional vs casual communication differences</li>
              <li>✅ Proper use of Teams and LMS messaging platforms</li>
              <li>✅ Virtual meeting etiquette and camera setup</li>
              <li>✅ Professional email structure and formatting</li>
              <li>✅ Appropriate tone and language for academic settings</li>
              <li>✅ Username and digital presence best practices</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Communication Toolkit:</h3>
            <div className="space-y-2 text-blue-100">
              <p>1. 📧 Professional email templates and examples</p>
              <p>2. 🎥 Virtual meeting setup and participation guidelines</p>
              <p>3. 💬 Platform-specific communication protocols</p>
              <p>4. 🎭 Code-switching skills for different contexts</p>
              <p>5. 📋 Pre-send email checklist for quality assurance</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Remember: Professional communication is a skill that improves with practice. 
            Use these tools consistently to build strong relationships with instructors and peers while 
            developing valuable workplace communication skills!
          </p>
        </div>
      </section>
    </div>
  );
};

export default CommunicationToolsEtiquette;