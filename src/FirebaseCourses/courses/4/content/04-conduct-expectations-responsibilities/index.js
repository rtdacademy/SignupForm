import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
// useProgress removed - completion tracking is now handled automatically

const ConductExpectationsAlbertaEducationResponsibilities = ({ course, courseId, itemId, activeItem, onNavigateToLesson, onNavigateToNext, onAIAccordionContent }) => {
  // markCompleted removed - completion tracking is now handled automatically
  const [activeSection, setActiveSection] = useState('overview');
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

  const handleQuestionComplete = (questionNumber) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [`question${questionNumber}`]: true
    }));
  };

  const allQuestionsCompleted = questionsCompleted.question1 && questionsCompleted.question2 && questionsCompleted.question3 && 
    questionsCompleted.question4 && questionsCompleted.question5 && questionsCompleted.question6 && 
    questionsCompleted.question7 && questionsCompleted.question8;

  // Completion tracking now handled automatically when all questions are answered
  // useEffect(() => {
  //   if (allQuestionsCompleted) {
  //     const lessonItemId = itemId || activeItem?.itemId;
  //     if (lessonItemId) {
  //       markCompleted(lessonItemId);
  //     }
  //   }
  // }, [allQuestionsCompleted, markCompleted, itemId, activeItem?.itemId]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Digital Citizenship and Online Safety</h1>
        <p className="text-xl mb-6">Learn to be a respectful, responsible, and professional member of our online learning community</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand RTD Academy's standards for professional online conduct, 
            communication expectations, academic integrity requirements, and student responsibilities in virtual learning environments.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Professional Conduct Overview' },
            { id: 'communication', label: 'Communication Standards' },
            { id: 'integrity', label: 'Academic Integrity' },
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

      {/* Professional Conduct Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Professional Online Conduct at RTD Academy</h2>
            <p className="text-gray-600 mb-6">
              As an RTD Academy student, you're expected to maintain professional standards in all online interactions and learning activities.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-teal-700">📋 Core Expectations</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-teal-50 rounded-lg p-4">
                  <h4 className="font-semibold text-teal-800 mb-3">✅ Professional Behavior</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Treat all instructors and students with respect</li>
                    <li>• Use appropriate language in all communications</li>
                    <li>• Maintain professional appearance during video calls</li>
                    <li>• Follow classroom etiquette in virtual sessions</li>
                    <li>• Respond to communications in a timely manner</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📧 Communication Standards</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Use clear, professional language in emails</li>
                    <li>• Include appropriate subject lines</li>
                    <li>• Respond within 24-48 hours when possible</li>
                    <li>• Use proper greetings and closings</li>
                    <li>• Ask questions clearly and specifically</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">🎓 Academic Integrity</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Complete all work independently unless otherwise stated</li>
                    <li>• Never share exam questions or answers</li>
                    <li>• Properly cite sources when required</li>
                    <li>• Follow exam security protocols strictly</li>
                    <li>• Report suspected violations to instructors</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">⚠️ Prohibited Behaviors</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Inappropriate or offensive language</li>
                    <li>• Sharing login credentials</li>
                    <li>• Disrupting virtual classroom sessions</li>
                    <li>• Plagiarism or academic dishonesty</li>
                    <li>• Harassment or bullying of any kind</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Communication Standards Section */}
      {activeSection === 'communication' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">💬 Professional Communication Standards</h2>
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
                    <p className="mt-2">Could you please provide some guidance or point me to additional resources?</p>
                    <p className="mt-2">Thank you for your time.</p>
                    <p className="mt-2"><strong>Best regards,<br/>Sarah Smith<br/>Student ID: 12345</strong></p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">❌ Unprofessional Example</h4>
                  <div className="bg-white rounded p-3 font-mono text-sm">
                    <p><strong>Subject:</strong> help</p>
                    <p className="mt-2"><strong>hey</strong></p>
                    <p className="mt-2">i dont get this stuff can u help???</p>
                    <p className="mt-2">thx</p>
                  </div>
                  <div className="mt-3 text-xs text-red-600">
                    Issues: Vague subject, informal greeting, unclear request, poor grammar
                  </div>
                </div>
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
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">🗣️ Communication Etiquette</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>• Mute when not speaking:</strong> Prevent background noise and distractions</li>
                    <li><strong>• Use chat appropriately:</strong> Ask questions or provide relevant comments</li>
                    <li><strong>• Raise hand to speak:</strong> Wait to be recognized before unmuting</li>
                    <li><strong>• Stay focused:</strong> Avoid multitasking during sessions</li>
                    <li><strong>• Be patient:</strong> Allow others to finish speaking</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">🛡️ Meeting Security</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Never share meeting links with unauthorized persons</li>
                    <li>• Don't record without explicit permission</li>
                    <li>• Report disruptive behavior to instructors</li>
                    <li>• Maintain professional appearance standards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Academic Integrity Section */}
      {activeSection === 'integrity' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎓 Academic Integrity & Student Responsibilities</h2>
            <p className="text-gray-600 mb-6">
              Understanding and maintaining academic integrity is essential for your success and the credibility of your RTD Academy education.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Critical Security Rules</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Never Share Login Information
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Your login credentials are strictly personal and confidential.</strong> Sharing them violates 
                    RTD Academy policy and compromises system security.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium mb-2">This includes:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Username and password</li>
                      <li>• Student portal access</li>
                      <li>• Email account credentials</li>
                      <li>• MyPass account information</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Password Security Best Practices</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>• Use unique passwords:</strong> Don't reuse passwords across sites</li>
                    <li><strong>• Keep them private:</strong> Never write them down in visible places</li>
                    <li><strong>• Change if compromised:</strong> Update immediately if you suspect a breach</li>
                    <li><strong>• Use strong passwords:</strong> Mix letters, numbers, and symbols</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">🔐 Account Privacy</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Protect your personal information and respect others' privacy:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Log out when using shared computers</li>
                    <li>• Don't access others' accounts</li>
                    <li>• Keep personal information confidential</li>
                    <li>• Report suspected security breaches</li>
                    <li>• Use secure internet connections</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📱 Device Security</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Lock your devices when not in use</li>
                    <li>• Keep software updated</li>
                    <li>• Use antivirus protection</li>
                    <li>• Be cautious with public WiFi</li>
                    <li>• Don't save passwords on shared devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Maintaining Academic Integrity</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Acceptable Practices</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Completing assignments independently</li>
                  <li>• Using approved resources and materials</li>
                  <li>• Asking instructors for clarification</li>
                  <li>• Collaborating only when explicitly permitted</li>
                  <li>• Properly citing any external sources</li>
                  <li>• Following all exam security protocols</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">Prohibited Behaviors</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Copying from other students</li>
                  <li>• Sharing exam questions or answers</li>
                  <li>• Using unauthorized materials during exams</li>
                  <li>• Plagiarizing from online sources</li>
                  <li>• Having someone else complete your work</li>
                  <li>• Accessing prohibited websites during exams</li>
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
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Online Conduct & Responsibilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of professional online conduct, communication standards, and academic integrity requirements.
            </p>
          </div>

          <SlideshowKnowledgeCheck
            courseId={courseId}
            lessonPath="04-conduct-expectations-responsibilities"
            course={course}
            // onAIAccordionContent={onAIAccordionContent}  // Commented out to hide "Ask AI" button
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question1',
                title: 'Question 1: Professional Email Communication'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question2',
                title: 'Question 2: Academic Integrity Requirements'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question3',
                title: 'Question 3: Virtual Meeting Etiquette'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question4',
                title: 'Question 4: Password Security Policy'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question5',
                title: 'Question 5: Student Responsibilities'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question6',
                title: 'Question 6: Login Credential Request'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question7',
                title: 'Question 7: Exam Sharing Request'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_04_conduct_expectations_question8',
                title: 'Question 8: Virtual Meeting Disruption'
              }
            ]}
            onComplete={(score, results) => {
              console.log(`Knowledge Check completed with ${score}%`);
              // Check if all questions are completed successfully
              const totalQuestions = 8;
              const correctCount = Object.values(results).filter(result => result === 'correct').length;
              if (correctCount >= 6 || score >= 75) {  // 75% passing threshold for 8 questions
                // Mark all questions as completed
                for (let i = 1; i <= totalQuestions; i++) {
                  setQuestionsCompleted(prev => ({...prev, [`question${i}`]: true}));
                }
                setQuestionResults(results);
              }
            }}
            theme="indigo"
          />
        </section>
      )}

      {/* Summary Section - Only show when all questions are completed */}
      {allQuestionsCompleted && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Lesson Complete! You're Ready for Professional Online Learning</h2>
          
          <div className="text-center mb-6">
            <p className="text-lg mb-4">
              You've mastered RTD Academy's standards for professional online conduct, communication, and academic integrity.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <p className="text-base">
                You're now prepared to participate professionally and responsibly in all RTD Academy learning activities.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
              <ul className="space-y-2 text-blue-100">
                <li>✅ Professional communication standards</li>
                <li>✅ Virtual meeting etiquette and expectations</li>
                <li>✅ Academic integrity requirements</li>
                <li>✅ Security and privacy best practices</li>
                <li>✅ Student responsibilities in online learning</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Your Action Items:</h3>
              <div className="space-y-2 text-blue-100">
                <p>1. 📧 Practice professional email communication</p>
                <p>2. 🔐 Secure your login credentials</p>
                <p>3. 🎭 Prepare your virtual meeting setup</p>
                <p>4. 📝 Review academic integrity policies</p>
                <p>5. 🎯 Apply these standards in all interactions</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ConductExpectationsAlbertaEducationResponsibilities;