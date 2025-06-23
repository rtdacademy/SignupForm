import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
// useProgress removed - completion tracking is now handled automatically

const ConductExpectationsAlbertaEducationResponsibilities = ({ courseId, itemId, activeItem }) => {
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
                    cloudFunctionName="course4_04_conduct_expectations_question1"
                    title="Professional Email Communication"
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
                    cloudFunctionName="course4_04_conduct_expectations_question2"
                    title="Academic Integrity Requirements"
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
                    cloudFunctionName="course4_04_conduct_expectations_question3"
                    title="Virtual Meeting Etiquette"
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
                    cloudFunctionName="course4_04_conduct_expectations_question4"
                    title="Password Security Policy"
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
                    cloudFunctionName="course4_04_conduct_expectations_question5"
                    title="Student Responsibilities"
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
                    cloudFunctionName="course4_04_conduct_expectations_question6"
                    title="Scenario: Login Credential Request"
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
                    cloudFunctionName="course4_04_conduct_expectations_question7"
                    title="Scenario: Exam Sharing Request"
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
                    cloudFunctionName="course4_04_conduct_expectations_question8"
                    title="Scenario: Virtual Meeting Disruption"
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