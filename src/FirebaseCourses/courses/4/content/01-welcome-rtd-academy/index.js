import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const WelcometoRTDAcademy = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [interactiveAnswers, setInteractiveAnswers] = useState({});
  
  // Drag and Drop Assessment State
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleInteractiveAnswer = (questionId, answer) => {
    setInteractiveAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Drag and Drop Assessment Data
  const assessmentTerms = [
    { id: 'asynchronous', term: 'Asynchronous Learning' },
    { id: 'lms', term: 'LMS' },
    { id: 'yourway', term: 'YourWay Portal' },
    { id: 'rolling', term: 'Rolling Enrollment' },
    { id: 'pasi', term: 'PASI' },
    { id: 'proctoring', term: 'Exam Proctoring' },
    { id: 'digital_citizenship', term: 'Digital Citizenship' },
    { id: 'academic_integrity', term: 'Academic Integrity' }
  ];

  const assessmentDefinitions = [
    { 
      id: 'asynchronous', 
      definition: 'Learning that doesn\'t require students to be online at the same time as instructors',
      dropZone: 'zone1'
    },
    { 
      id: 'lms', 
      definition: 'Learning Management System - your digital classroom for accessing content and submitting work',
      dropZone: 'zone2'
    },
    { 
      id: 'yourway', 
      definition: 'Personal academic dashboard for schedules, registration, and RTD Academy services',
      dropZone: 'zone3'
    },
    { 
      id: 'rolling', 
      definition: 'Continuous enrollment throughout the year, not limited to semester start dates',
      dropZone: 'zone4'
    },
    { 
      id: 'pasi', 
      definition: 'Provincial Approach to Student Information - Alberta\'s student record system',
      dropZone: 'zone5'
    },
    { 
      id: 'proctoring', 
      definition: 'Supervised exam monitoring using webcam and secondary device for security',
      dropZone: 'zone6'
    },
    { 
      id: 'digital_citizenship', 
      definition: 'Using technology safely, respectfully, and responsibly in online learning environments',
      dropZone: 'zone7'
    },
    { 
      id: 'academic_integrity', 
      definition: 'Honest and ethical behavior in all coursework and assessments',
      dropZone: 'zone8'
    }
  ];

  // Drag and Drop Functions
  const handleDragStart = (e, term) => {
    setDraggedItem(term);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, definition) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [definition.id]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const checkAssessment = () => {
    let correctCount = 0;
    assessmentDefinitions.forEach(def => {
      if (matches[def.id] && matches[def.id].id === def.id) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setAssessmentCompleted(true);
  };

  const resetAssessment = () => {
    setMatches({});
    setAssessmentCompleted(false);
    setScore(0);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to RTD Math Academy</h1>
        <p className="text-xl mb-6">Your gateway to flexible, high-quality online education in Math, Physics, and STEM</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objective:</strong> Understand what RTD Math Academy is, how asynchronous learning works, 
            and what tools and expectations will guide your success.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Academy Overview' },
            { id: 'vision', label: 'Vision & Values' },
            { id: 'team', label: 'Meet the Team' },
            { id: 'learning', label: 'Digital Learning' },
            { id: 'tools', label: 'Your Tools' },
            { id: 'expectations', label: 'What to Expect' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Academy Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">What is RTD Math Academy?</h2>
            <p className="text-gray-700 mb-4">
              RTD Math Academy is Alberta's leading online school specializing in Mathematics, Physics, and STEM education. 
              We're not just another online school – we're a community dedicated to helping you succeed in a flexible, 
              supportive digital environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-3 text-green-700">✅ What Makes Us Different</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Asynchronous Learning:</strong> Learn at your own pace, on your own schedule</li>
                <li>• <strong>STEM Specialization:</strong> Expert focus on Math, Physics, and Science</li>
                <li>• <strong>Alberta Accredited:</strong> Fully recognized by Alberta Education</li>
                <li>• <strong>Flexible Timeline:</strong> Complete courses within one year</li>
                <li>• <strong>AI-Enhanced:</strong> Modern tools to support your learning</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-3 text-orange-700">🏫 Traditional vs RTD Academy</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium text-gray-600">Traditional School</div>
                  <div className="font-medium text-blue-600">RTD Academy</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Fixed class times</div>
                  <div>Learn anytime, anywhere</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Same pace for everyone</div>
                  <div>Your own pace</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Physical classroom</div>
                  <div>Digital classroom</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Limited subjects</div>
                  <div>STEM specialization</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Check */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">💭 Quick Reflection</h3>
            <p className="mb-3">What's the main difference you see between RTD Academy and traditional school?</p>
            <div className="space-y-2">
              {['Flexibility in learning pace and schedule', 'Focus on STEM subjects', 'Online vs physical classroom', 'All of the above'].map((option, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reflection1"
                    onChange={() => handleInteractiveAnswer('reflection1', option)}
                    className="text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {interactiveAnswers.reflection1 === 'All of the above' && (
              <div className="mt-3 p-3 bg-green-100 rounded text-green-800">
                ✅ Excellent! You understand the key differences that make RTD Academy unique.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Vision & Values Section */}
      {activeSection === 'vision' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Vision, Mission & Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These aren't just words on a page – they guide everything we do and shape your experience at RTD Academy.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">🔮 Our Vision</h3>
              <p className="text-purple-100">
                To be a leading force in online education, where every student—regardless of background—has the 
                opportunity, flexibility, and support to excel in mathematics, physics, and STEM disciplines, 
                preparing them to thrive in a rapidly evolving world.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
              <p className="text-blue-100">
                RTD Math Academy empowers students through high-quality, flexible, and accessible online education 
                in Math, Physics, and STEM. We are committed to fostering academic excellence, building confidence, 
                and equipping learners with critical thinking and problem-solving skills.
              </p>
            </div>

            {/* Values Preview */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">💎 Our Values</h3>
              <ul className="text-green-100 space-y-2">
                <li>✨ Excellence in Education</li>
                <li>🤝 Inclusivity & Accessibility</li>
                <li>⚡ Flexibility</li>
                <li>🌟 Community Building</li>
              </ul>
            </div>
          </div>

          {/* Detailed Values */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">How Our Values Shape Your Experience</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">Excellence in Education</h4>
                <p className="text-gray-700 text-sm mb-4">
                  We deliver rigorous, engaging, and future-focused curriculum designed to challenge and inspire you.
                </p>
                
                <h4 className="font-semibold text-blue-700 mb-2">Inclusivity and Accessibility</h4>
                <p className="text-gray-700 text-sm">
                  Equitable access to learning for all students, regardless of socio-economic background or location.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Flexibility</h4>
                <p className="text-gray-700 text-sm mb-4">
                  Asynchronous learning that adapts to your unique schedule, learning style, and pace.
                </p>
                
                <h4 className="font-semibold text-orange-700 mb-2">Community Building</h4>
                <p className="text-gray-700 text-sm">
                  A respectful, innovative, and collaborative online environment where you feel supported and connected.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {activeSection === 'team' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Meet Your RTD Academy Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These are the people who will support your journey at RTD Academy. Don't hesitate to reach out when you need help!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Principal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">KB</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kyle Brown</h3>
              <p className="text-blue-600 font-medium mb-3">Principal</p>
              <p className="text-gray-700 text-sm mb-4">
                Academic policies, school-wide questions, and educational leadership. Kyle ensures RTD Academy 
                maintains high standards and supports student success.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-medium">Contact Kyle for:</p>
                <p className="text-xs text-gray-600">Academic policies • School-wide questions • Leadership matters</p>
                <p className="text-blue-600 text-sm mt-2">📧 kyle@rtdacademy.com</p>
              </div>
            </div>

            {/* Vice Principal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">CH</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Charlie Hiles</h3>
              <p className="text-green-600 font-medium mb-3">Vice Principal</p>
              <p className="text-gray-700 text-sm mb-4">
                Course-related inquiries, student support, concerns, and scheduling. Charlie is your go-to person 
                for day-to-day academic support and guidance.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-medium">Contact Charlie for:</p>
                <p className="text-xs text-gray-600">Course support • Scheduling • Student concerns • Academic guidance</p>
                <p className="text-green-600 text-sm mt-2">📧 charlie@rtdacademy.com</p>
              </div>
            </div>

            {/* IT Support */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">SS</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stan Scott</h3>
              <p className="text-orange-600 font-medium mb-3">IT Support</p>
              <p className="text-gray-700 text-sm mb-4">
                Technical support for login issues, platform access problems, and any technology-related difficulties 
                you might encounter during your studies.
              </p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-medium">Contact Stan for:</p>
                <p className="text-xs text-gray-600">Login issues • Technical problems • Platform access • Tech support</p>
                <p className="text-orange-600 text-sm mt-2">📧 stan@rtdacademy.com</p>
              </div>
            </div>
          </div>

          {/* General Contact Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">General Contact Information</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-medium text-blue-700">📧 Email</p>
                <p className="text-sm">info@rtdacademy.com</p>
              </div>
              <div>
                <p className="font-medium text-blue-700">📞 Phone</p>
                <p className="text-sm">403.351.0896</p>
              </div>
              <div>
                <p className="font-medium text-blue-700">🌐 Website</p>
                <p className="text-sm">www.rtdacademy.com</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Digital Learning Section */}
      {activeSection === 'learning' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Understanding Digital Learning</h2>
            <p className="text-gray-600 mb-6">
              Digital literacy isn't just about using technology – it's about being a responsible, effective, 
              and safe digital citizen in your learning environment.
            </p>
          </div>

          {/* What is Digital Literacy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🎓 What is Digital Literacy?</h3>
            <p className="text-gray-700 mb-4">
              Digital literacy means using technology in a safe, respectful, and productive way. At RTD Academy, 
              this includes understanding how to navigate online learning platforms, communicate effectively in 
              digital spaces, and maintain academic integrity in virtual environments.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-2">✅ Digital Literacy Skills You'll Develop</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Navigating online learning platforms effectively</li>
                  <li>• Communicating professionally in digital spaces</li>
                  <li>• Managing your digital footprint responsibly</li>
                  <li>• Using technology tools for learning and productivity</li>
                  <li>• Understanding privacy and security online</li>
                  <li>• Evaluating digital information critically</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">🛡️ Digital Citizenship at RTD</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Respectful online behavior and communication</li>
                  <li>• Academic integrity in digital assessments</li>
                  <li>• Protecting personal and others' privacy</li>
                  <li>• Responsible use of school technology resources</li>
                  <li>• Reporting inappropriate online behavior</li>
                  <li>• Understanding digital rights and responsibilities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Traditional vs E-Learning Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🏫 Traditional Learning vs E-Learning</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">Aspect</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-600">Traditional Classroom</th>
                    <th className="text-left py-2 px-4 font-semibold text-blue-600">RTD E-Learning</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Schedule</td>
                    <td className="py-3 px-4 text-gray-700">Fixed class times (8 AM - 3 PM)</td>
                    <td className="py-3 px-4 text-blue-700">Flexible, 24/7 access</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Learning Pace</td>
                    <td className="py-3 px-4 text-gray-700">Same pace for all students</td>
                    <td className="py-3 px-4 text-blue-700">Individual pace (asynchronous)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Location</td>
                    <td className="py-3 px-4 text-gray-700">Physical school building</td>
                    <td className="py-3 px-4 text-blue-700">Anywhere with internet</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Interaction</td>
                    <td className="py-3 px-4 text-gray-700">Face-to-face discussions</td>
                    <td className="py-3 px-4 text-blue-700">Virtual meetings, online forums</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Resources</td>
                    <td className="py-3 px-4 text-gray-700">Textbooks, handouts</td>
                    <td className="py-3 px-4 text-blue-700">Digital content, interactive tools</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Assessment</td>
                    <td className="py-3 px-4 text-gray-700">Paper tests, in-person exams</td>
                    <td className="py-3 px-4 text-blue-700">Online quizzes, proctored exams</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Learning Check */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🤔 Think About This</h3>
            <p className="mb-3">What do you think is the biggest advantage of e-learning for your situation?</p>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows="3"
              placeholder="Share your thoughts here..."
              onChange={(e) => handleInteractiveAnswer('elearning_advantage', e.target.value)}
            />
            {interactiveAnswers.elearning_advantage && (
              <div className="mt-3 p-3 bg-blue-100 rounded text-blue-800">
                💭 Great reflection! Understanding what works best for you will help you succeed in our e-learning environment.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tools Section */}
      {activeSection === 'tools' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Your Learning Tools</h2>
            <p className="text-gray-600 mb-6">
              These digital tools will be your companions throughout your RTD Academy journey. Let's get familiar with each one.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* LMS Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Learning Management System (LMS)</h3>
                  <p className="text-gray-600 text-sm">Your digital classroom</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  The LMS is where you'll access all your course content, submit assignments, take quizzes, 
                  and track your progress. Think of it as your virtual classroom and study space combined.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">What you'll do in the LMS:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Access lesson content and videos</li>
                    <li>• Submit assignments and projects</li>
                    <li>• Take quizzes and practice tests</li>
                    <li>• View grades and feedback</li>
                    <li>• Participate in discussions</li>
                    <li>• Track your course progress</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm"><strong>💡 Pro Tip:</strong> Bookmark your LMS page and check it daily to stay on track!</p>
                </div>
              </div>
            </div>

            {/* YourWay Portal Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">YourWay Student Portal</h3>
                  <p className="text-gray-600 text-sm">Your personal academic dashboard</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  YourWay Portal is your personalized dashboard where you manage your academic journey, 
                  view schedules, access resources, and stay connected with RTD Academy services.
                </p>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">What you'll find in YourWay Portal:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Personal course schedule and timeline</li>
                    <li>• Registration information and deadlines</li>
                    <li>• Academic records and transcripts</li>
                    <li>• Payment and billing information</li>
                    <li>• Important announcements</li>
                    <li>• Contact information and support</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm"><strong>💡 Pro Tip:</strong> Check YourWay Portal weekly for important updates and deadlines!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Tools */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Other Important Tools You'll Use</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl mb-2 block">📹</span>
                <h4 className="font-semibold mb-2">Microsoft Teams</h4>
                <p className="text-sm text-gray-700">Virtual meetings, office hours, and exam proctoring</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl mb-2 block">📧</span>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-sm text-gray-700">Communication with instructors and announcements</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl mb-2 block">📱</span>
                <h4 className="font-semibold mb-2">Mobile Apps</h4>
                <p className="text-sm text-gray-700">Access your courses on-the-go (Teams, email apps)</p>
              </div>
            </div>
          </div>

          {/* Technology Requirements Reminder */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-orange-800">📋 Quick Technology Check</h3>
            <p className="text-orange-700 mb-3">Make sure you have the minimum requirements to use these tools effectively:</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Required Equipment:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Laptop or desktop with webcam & microphone</li>
                  <li>• High-speed internet (minimum 10 Mbps)</li>
                  <li>• Updated web browser (Chrome/Edge recommended)</li>
                  <li>• Secondary device for exam proctoring (phone/tablet)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Software Access:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Microsoft Teams account</li>
                  <li>• PDF viewer and word processor</li>
                  <li>• Access to your email</li>
                  <li>• Current RTD Academy login credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Expectations Section */}
      {activeSection === 'expectations' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">What to Expect: Asynchronous Learning</h2>
            <p className="text-gray-600 mb-6">
              Understanding asynchronous learning and your responsibilities is key to your success at RTD Academy.
            </p>
          </div>

          {/* What is Asynchronous Learning */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🕐 What is Asynchronous Learning?</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 mb-4">
                  <strong>Asynchronous learning</strong> means you don't have to be online at the same time as your 
                  instructor or classmates. You can access course materials, complete assignments, and learn at 
                  times that work best for your schedule.
                </p>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">✅ Benefits of Asynchronous Learning:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Learn at your own pace</li>
                    <li>• Flexible scheduling around work/life</li>
                    <li>• Time to think before responding</li>
                    <li>• Review materials as often as needed</li>
                    <li>• Accommodate different learning styles</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-700 mb-2">📚 What This Means for You:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Course content available 24/7</li>
                    <li>• No fixed class times to attend</li>
                    <li>• Deadlines instead of daily schedules</li>
                    <li>• Self-directed learning environment</li>
                    <li>• Virtual office hours for support</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">⚠️ Important to Remember:</h4>
                  <p className="text-sm text-gray-700">
                    Flexible doesn't mean "no structure." You still have deadlines, requirements, 
                    and expectations to meet!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Responsibilities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">📋 Your Responsibilities as an RTD Student</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">🚨 Non-Negotiable Requirements</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>• Log in weekly:</strong> Access your course at least once per week</li>
                    <li><strong>• Stay on schedule:</strong> Remain within 2 lessons of your target date</li>
                    <li><strong>• Complete check-ins:</strong> Monday check-in and Friday reflection</li>
                    <li><strong>• Respond to communication:</strong> Check and respond to emails promptly</li>
                    <li><strong>• Meet deadlines:</strong> Submit assignments and exams on time</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-700 mb-2">⚠️ Consequences of Inactivity</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Inactive for 1+ week = Course access locked</li>
                    <li>• Must meet with RTD Administration within 1 week</li>
                    <li>• No meeting = Withdrawal from course</li>
                    <li>• Current grade will be submitted to PASI</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">💡 Tips for Success</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>• Create a routine:</strong> Set regular study times</li>
                    <li><strong>• Use your calendar:</strong> Track deadlines and targets</li>
                    <li><strong>• Ask for help early:</strong> Don't wait until you're behind</li>
                    <li><strong>• Engage actively:</strong> Participate in discussions and activities</li>
                    <li><strong>• Stay organized:</strong> Keep track of assignments and progress</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">🎯 Course Completion Timeline</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Complete courses within <strong>one year</strong></li>
                    <li>• Extensions available under special circumstances</li>
                    <li>• Final grades submitted after Section 1 exam</li>
                    <li>• Contact administration for timeline concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Planning Activity */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">📅 Plan Your Success</h3>
            <p className="mb-4">Based on what you've learned, when do you plan to access your courses each week?</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Best days for coursework:</label>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input type="checkbox" className="text-purple-600" />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preferred study times:</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Select your preferred time</option>
                  <option>Early morning (6-9 AM)</option>
                  <option>Morning (9 AM-12 PM)</option>
                  <option>Afternoon (12-5 PM)</option>
                  <option>Evening (5-9 PM)</option>
                  <option>Late evening (9 PM+)</option>
                </select>
                
                <label className="block text-sm font-medium mb-2 mt-4">Weekly study goal (hours):</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded" 
                  placeholder="e.g., 10 hours"
                  min="1" 
                  max="40"
                />
              </div>
            </div>
            
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-700">
                💡 <strong>Remember:</strong> Consistency is more important than intensity. 
                It's better to study 1-2 hours daily than to cram 10 hours on the weekend!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 RTD Academy Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of RTD Academy terms by dragging each term to its correct definition. 
              This will help reinforce what you've learned about our online learning environment.
            </p>
          </div>

          {!assessmentCompleted && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">📝 Instructions</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">How to Complete:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>1. Drag terms from the left side</li>
                    <li>2. Drop them on matching definitions</li>
                    <li>3. Click "Check My Answers" when done</li>
                    <li>4. Review your results and try again if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Success Tips:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Think about what you learned in each section</li>
                    <li>• Consider RTD Academy's unique features</li>
                    <li>• Remember the tools and policies discussed</li>
                    <li>• Take your time to read definitions carefully</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Terms to Drag */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">📚 RTD Academy Terms</h3>
                <p className="text-sm text-gray-600 mb-4">Drag these terms to their matching definitions →</p>
                
                <div className="space-y-3">
                  {assessmentTerms.map((term) => {
                    const isUsed = Object.values(matches).some(match => match && match.id === term.id);
                    
                    return (
                      <div
                        key={term.id}
                        draggable={!assessmentCompleted}
                        onDragStart={(e) => handleDragStart(e, term)}
                        className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                          isUsed 
                            ? 'bg-gray-100 border-gray-300 opacity-50' 
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                        } ${
                          assessmentCompleted ? 'cursor-default' : 'cursor-move'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🏷️</span>
                          <span className="font-medium">{term.term}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Definitions Drop Zones */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-700">🎯 Match the Definitions</h3>
                <p className="text-sm text-gray-600 mb-4">Drop the correct terms here ↓</p>
                
                <div className="space-y-3">
                  {assessmentDefinitions.map((definition) => {
                    const matchedTerm = matches[definition.id];
                    const isCorrect = assessmentCompleted && matchedTerm && matchedTerm.id === definition.id;
                    const isIncorrect = assessmentCompleted && matchedTerm && matchedTerm.id !== definition.id;
                    
                    return (
                      <div
                        key={definition.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, definition)}
                        className={`p-4 rounded-lg border-2 border-dashed min-h-[80px] transition-all ${
                          matchedTerm
                            ? isCorrect
                              ? 'bg-green-50 border-green-300'
                              : isIncorrect
                              ? 'bg-red-50 border-red-300'
                              : 'bg-gray-50 border-gray-300'
                            : 'bg-green-50 border-green-200 hover:border-green-400'
                        }`}
                      >
                        <p className="text-sm text-gray-700 mb-2">{definition.definition}</p>
                        
                        {matchedTerm && (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isCorrect
                              ? 'bg-green-100 text-green-800'
                              : isIncorrect
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <span className="mr-1">
                              {isCorrect ? '✅' : isIncorrect ? '❌' : '🏷️'}
                            </span>
                            {matchedTerm.term}
                          </div>
                        )}
                        
                        {!matchedTerm && (
                          <div className="text-gray-400 text-sm italic">
                            Drop term here...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assessment Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {!assessmentCompleted ? (
                <div className="text-center">
                  <button
                    onClick={checkAssessment}
                    disabled={Object.keys(matches).length < assessmentDefinitions.length}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      Object.keys(matches).length < assessmentDefinitions.length
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    🔍 Check My Answers ({Object.keys(matches).length}/{assessmentDefinitions.length})
                  </button>
                  
                  {Object.keys(matches).length > 0 && (
                    <button
                      onClick={resetAssessment}
                      className="ml-4 px-4 py-2 text-gray-600 hover:text-gray-800 underline"
                    >
                      🔄 Reset All
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className={`inline-block p-4 rounded-lg mb-4 ${
                    score >= 7 ? 'bg-green-100' : score >= 5 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <h3 className="text-xl font-bold mb-2">
                      {score >= 7 ? '🎉 Excellent Work!' : score >= 5 ? '👍 Good Job!' : '📚 Keep Learning!'}
                    </h3>
                    <p className="text-lg font-medium">
                      Your Score: {score}/{assessmentDefinitions.length} ({Math.round((score/assessmentDefinitions.length)*100)}%)
                    </p>
                    
                    {score >= 7 && (
                      <p className="text-green-700 mt-2">
                        Outstanding! You have a solid understanding of RTD Academy's structure and terminology.
                      </p>
                    )}
                    
                    {score >= 5 && score < 7 && (
                      <p className="text-yellow-700 mt-2">
                        Good work! Review the sections you missed to strengthen your understanding.
                      </p>
                    )}
                    
                    {score < 5 && (
                      <p className="text-red-700 mt-2">
                        Consider reviewing the lesson content and trying again to improve your understanding.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-x-4">
                    <button
                      onClick={resetAssessment}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      🔄 Try Again
                    </button>
                    
                    <button
                      onClick={() => setActiveSection('overview')}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                      📖 Review Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-indigo-800">📌 Quick Reference Guide</h3>
            <p className="text-indigo-700 text-sm mb-3">
              If you need to review any of these concepts, here's where to find them in the lesson:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Learning & Tools:</h4>
                <ul className="space-y-1 text-indigo-600">
                  <li>• Asynchronous Learning → "What to Expect" section</li>
                  <li>• LMS & YourWay Portal → "Your Tools" section</li>
                  <li>• Digital Citizenship → "Digital Learning" section</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Policies & Systems:</h4>
                <ul className="space-y-1 text-indigo-600">
                  <li>• Rolling Enrollment → "Academy Overview" section</li>
                  <li>• PASI & Exam Proctoring → Student Handbook info</li>
                  <li>• Academic Integrity → Future lessons</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Summary and Next Steps */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 Welcome to Your RTD Academy Journey!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">What You've Learned Today:</h3>
            <ul className="space-y-2 text-green-100">
              <li>✅ What RTD Math Academy is and what makes us unique</li>
              <li>✅ Our vision, mission, and values that guide your experience</li>
              <li>✅ Your support team and how to contact them</li>
              <li>✅ The tools you'll use for learning (LMS, YourWay Portal)</li>
              <li>✅ What asynchronous learning means and your responsibilities</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Next Steps:</h3>
            <div className="space-y-2 text-green-100">
              <p>1. 📱 Bookmark your LMS and YourWay Portal</p>
              <p>2. 📧 Save your instructor and support contact information</p>
              <p>3. 📅 Plan your weekly study schedule</p>
              <p>4. 🔍 Continue to the next lesson: Learning Plans & Policies</p>
              <p>5. 📝 Complete your first check-in activity</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Ready to start your flexible learning journey? You've got this, and we're here to support you every step of the way!
          </p>
        </div>
      </section>
    </div>
  );
};

export default WelcometoRTDAcademy;