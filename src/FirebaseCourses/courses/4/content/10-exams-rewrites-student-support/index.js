import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ExamsRewritesStudentSupportResources = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('rewrite-policy');
  const [supportPlanData, setSupportPlanData] = useState({
    academicChallenges: '',
    learningNeeds: '',
    timeManagement: '',
    communicationPrefs: '',
    techSupport: false,
    wellnessSupport: false,
    academicSupport: false
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    supportType: '',
    urgency: '',
    description: '',
    preferredContact: ''
  });

  // Reflection state
  const [reflectionData, setReflectionData] = useState({
    elearningExperience: '',
    challengesFaced: '',
    successfulStrategies: '',
    personalGrowth: '',
    connectionsToCourse: '',
    futureGoals: '',
    completed: false
  });

  // Checklist state for course readiness
  const [readinessChecklist, setReadinessChecklist] = useState({
    understandRewritePolicy: false,
    knowSupportContacts: false,
    familiarWithISP: false,
    practiceTestCompleted: false,
    technologyTested: false,
    studySpaceReady: false,
    scheduleCreated: false,
    goalsSet: false
  });

  const [showReflectionFeedback, setShowReflectionFeedback] = useState(false);

  const handleSupportPlanChange = (field, value) => {
    setSupportPlanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReflectionChange = (field, value) => {
    setReflectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChecklistChange = (item) => {
    setReadinessChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const submitReflection = () => {
    if (reflectionData.elearningExperience.length > 100 && 
        reflectionData.connectionsToCourse.length > 50) {
      setReflectionData(prev => ({ ...prev, completed: true }));
      setShowReflectionFeedback(true);
    }
  };

  const calculateReadinessPercentage = () => {
    const completed = Object.values(readinessChecklist).filter(Boolean).length;
    return Math.round((completed / Object.keys(readinessChecklist).length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Exams, Rewrites & Student Support Resources</h1>
        <p className="text-xl mb-6">Master RTD Academy's support systems and prepare for your academic journey ahead</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand RTD's rewrite policy and procedures, 
            learn about student support services and ISPs, master contact procedures for help, 
            and prepare confidently for your first academic course.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'rewrite-policy', label: 'Rewrite Policy' },
            { id: 'appeals-process', label: 'Appeals Process' },
            { id: 'isp-support', label: 'Instructional Support Plans' },
            { id: 'contact-support', label: 'Getting Support' },
            { id: 'support-services', label: 'Types of Support' },
            { id: 'proactive-help', label: 'Proactive Support Use' },
            { id: 'reflection', label: 'E-Learning Reflection' },
            { id: 'course-readiness', label: 'Course Readiness' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Rewrite Policy Section */}
      {activeSection === 'rewrite-policy' && (
        <section className="space-y-6">
          <div className="bg-emerald-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-900">📝 RTD Academy Rewrite Policy</h2>
            <p className="text-gray-700 mb-4">
              RTD Academy's rewrite policy provides students with an opportunity to improve their section exam performance 
              while maintaining academic standards and fairness for all students.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📋 Rewrite Eligibility Requirements</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    One Rewrite Per Course
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Each student is entitled to <strong>one rewrite opportunity per course</strong>. This applies to any single section exam of your choice.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Important details:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Can be used for Section 1, Section 2, or Section 3 exam</li>
                      <li>• Student chooses which exam to rewrite</li>
                      <li>• Only one exam can be rewritten per course</li>
                      <li>• Higher score between original and rewrite is kept</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    All Exams Must Be Completed
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students must complete <strong>all three section exams</strong> before becoming eligible for a rewrite.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Completion requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Section 1 exam: completed and graded</li>
                      <li>• Section 2 exam: completed and graded</li>
                      <li>• Section 3 exam: completed and graded</li>
                      <li>• All course content must be finished</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Practice Test Threshold
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Before requesting a rewrite, students must complete the <strong>practice test for that section</strong> and achieve the minimum threshold score.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Practice test requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Must score at least 70% on practice test</li>
                      <li>• Practice test specific to the section being rewritten</li>
                      <li>• Demonstrates readiness for rewrite attempt</li>
                      <li>• Must be completed before rewrite scheduling</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Request Process
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Rewrite requests must be submitted through your instructor with proper justification and preparation evidence.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Required for request:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Completed practice test with qualifying score</li>
                      <li>• Written explanation of preparation improvements</li>
                      <li>• Instructor approval and scheduling</li>
                      <li>• Confirmation of study plan completion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚫 What Cannot Be Rewritten</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">Quizzes and Daily Assessments</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Quiz rewrites are not allowed</strong> under any circumstances. This includes all course quizzes, daily assessments, and formative evaluations.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Non-rewritable assessments:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Weekly quizzes</li>
                    <li>• Chapter assessments</li>
                    <li>• Daily check-in quizzes</li>
                    <li>• Practice assessments</li>
                    <li>• Participation grades</li>
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">Diploma Exams</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Diploma exam rewrites are governed by Alberta Education policy, not RTD Academy policy.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Diploma exam information:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Separate fees and registration through MyPass</li>
                    <li>• Provincial rewrite policies apply</li>
                    <li>• RTD Academy assists with scheduling</li>
                    <li>• Different timeline and requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">💡 Rewrite Success Tips</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Strategic Planning:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Choose your lowest-scoring section exam</li>
                  <li>• Allow adequate time for additional study</li>
                  <li>• Complete all course content first</li>
                  <li>• Focus on areas of weakness</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Preparation Requirements:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Master the practice test thoroughly</li>
                  <li>• Review instructor feedback from original exam</li>
                  <li>• Create a targeted study plan</li>
                  <li>• Seek help from instructional support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timing Considerations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Request early to allow scheduling time</li>
                  <li>• Consider course deadlines</li>
                  <li>• Plan around other commitments</li>
                  <li>• Allow for technical setup if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Appeals Process Section */}
      {activeSection === 'appeals-process' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚖️ Appeals Process for Mark Disputes</h2>
            <p className="text-gray-600 mb-6">
              RTD Academy provides a fair and transparent process for students who wish to appeal grades or contest marking decisions.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📋 When You Can Appeal</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Valid Grounds for Appeal</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Appeals are considered when there are legitimate concerns about marking accuracy or fairness.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Acceptable appeal reasons:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Mathematical or computational errors in grading</li>
                    <li>• Marking criteria not applied consistently</li>
                    <li>• Answers marked incorrect that are demonstrably correct</li>
                    <li>• Rubric not followed according to course guidelines</li>
                    <li>• Technical issues affected submission or grading</li>
                    <li>• Discrimination or bias concerns in evaluation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Invalid Appeal Reasons</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Some concerns do not constitute grounds for formal grade appeals.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Not grounds for appeal:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Disagreement with instructor's professional judgment</li>
                    <li>• Belief that effort should result in higher grades</li>
                    <li>• Comparison with other students' grades</li>
                    <li>• General dissatisfaction with course difficulty</li>
                    <li>• Requesting extra credit or bonus opportunities</li>
                    <li>• Appeals submitted after final grade deadlines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📝 Appeal Process Steps</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div className="flex-grow">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Informal Discussion (Within 5 Business Days)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        First, attempt to resolve the concern directly with your course instructor through email or office hours.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Informal discussion should include:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Specific questions about marking criteria</li>
                          <li>• Request for clarification on feedback</li>
                          <li>• Discussion of any technical issues</li>
                          <li>• Understanding of grading rationale</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div className="flex-grow">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Formal Written Appeal (Within 10 Business Days)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If informal discussion doesn't resolve the issue, submit a formal written appeal to the course coordinator.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Required documentation:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Completed appeal form</li>
                          <li>• Copy of original submission and feedback</li>
                          <li>• Detailed explanation of concern</li>
                          <li>• Evidence supporting your position</li>
                          <li>• Record of informal discussion attempts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div className="flex-grow">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Review and Investigation (5-10 Business Days)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        The appeal is reviewed by an independent faculty member and the academic coordinator.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Investigation process:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Review of original work and marking</li>
                          <li>• Comparison with course standards</li>
                          <li>• Consultation with subject matter experts</li>
                          <li>• Examination of all relevant documentation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div className="flex-grow">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Decision and Communication</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        A written decision is provided with detailed rationale and any grade changes if applicable.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Possible outcomes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Appeal upheld - grade increased</li>
                          <li>• Appeal partially upheld - some adjustments made</li>
                          <li>• Appeal denied - original grade stands</li>
                          <li>• Appeal referred to higher authority if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">📞 Appeal Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Primary Contact:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>Email:</strong> appeals@rtdacademy.com</li>
                  <li>• <strong>Phone:</strong> 403.351.0896</li>
                  <li>• <strong>Response Time:</strong> 2-3 business days</li>
                  <li>• <strong>Office Hours:</strong> Monday-Friday 8am-5pm</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Important Deadlines:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• <strong>Informal Discussion:</strong> 5 business days</li>
                  <li>• <strong>Formal Appeal:</strong> 10 business days</li>
                  <li>• <strong>Final Deadline:</strong> 30 days from grade posting</li>
                  <li>• <strong>Extensions:</strong> Only for documented emergencies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ISP Support Section */}
      {activeSection === 'isp-support' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📚 Instructional Support Plans (ISPs)</h2>
            <p className="text-gray-600 mb-6">
              Learn how to access and utilize Instructional Support Plans to enhance your learning experience and academic success.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🎯 What are Instructional Support Plans?</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">ISP Overview</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Instructional Support Plans (ISPs) are personalized academic support strategies designed to help students 
                  overcome specific learning challenges and achieve their educational goals.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">ISPs can help with:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Learning disabilities and accommodations</li>
                    <li>• Time management and study skills</li>
                    <li>• Specific subject area difficulties</li>
                    <li>• Test anxiety and exam preparation</li>
                    <li>• Motivation and engagement strategies</li>
                    <li>• Technology integration challenges</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Who Can Access ISPs?</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Any RTD Academy student can request an ISP consultation. Plans are particularly beneficial for students 
                  facing academic challenges or those who want to optimize their learning strategies.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Common ISP candidates:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Students with documented learning differences</li>
                    <li>• First-time online learners</li>
                    <li>• Students returning to education after a break</li>
                    <li>• Those struggling with specific subjects</li>
                    <li>• Students seeking to improve study efficiency</li>
                    <li>• Anyone wanting personalized academic support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📋 How to Access ISP Services</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Initial Request
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Contact RTD Academy to request an ISP consultation. This can be done at any time during your enrollment.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-medium mb-2">Contact methods:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Email: support@rtdacademy.com with "ISP Request" in subject</li>
                    <li>• Phone: 403.351.0896 during business hours</li>
                    <li>• Online form: Available in student portal</li>
                    <li>• Through your course instructor</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Assessment and Planning
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  A qualified educational specialist will conduct an assessment to understand your learning needs and challenges.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-medium mb-2">Assessment includes:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Learning style evaluation</li>
                    <li>• Academic history review</li>
                    <li>• Current challenge identification</li>
                    <li>• Goal setting and priority establishment</li>
                    <li>• Technology comfort assessment</li>
                    <li>• Support system evaluation</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  Plan Development
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Based on the assessment, a personalized ISP is created with specific strategies, accommodations, and resources.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-medium mb-2">Plan components:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Specific learning strategies</li>
                    <li>• Accommodation recommendations</li>
                    <li>• Technology tools and resources</li>
                    <li>• Study schedule and time management</li>
                    <li>• Regular check-in schedule</li>
                    <li>• Progress monitoring methods</li>
                  </ul>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                  Implementation and Support
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Your ISP is implemented with ongoing support, regular check-ins, and plan adjustments as needed.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-medium mb-2">Ongoing support includes:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Weekly or bi-weekly check-ins</li>
                    <li>• Strategy coaching and refinement</li>
                    <li>• Crisis intervention if needed</li>
                    <li>• Plan modifications based on progress</li>
                    <li>• Coordination with course instructors</li>
                    <li>• Resource updates and new tool introduction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">🛠️ Create Your Personal Support Plan</h3>
            
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">Self-Assessment Exercise</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Complete this brief self-assessment to identify areas where an ISP might be beneficial for you.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">What academic challenges are you currently facing?</label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Describe any learning difficulties, time management issues, or subject-specific challenges..."
                      value={supportPlanData.academicChallenges}
                      onChange={(e) => handleSupportPlanChange('academicChallenges', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">What are your specific learning needs and preferences?</label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Visual learner, need quiet environment, prefer hands-on activities, etc..."
                      value={supportPlanData.learningNeeds}
                      onChange={(e) => handleSupportPlanChange('learningNeeds', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">How do you currently manage your study time?</label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="2"
                      placeholder="Describe your current study schedule, time management strategies, or challenges..."
                      value={supportPlanData.timeManagement}
                      onChange={(e) => handleSupportPlanChange('timeManagement', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">What type of support would be most helpful?</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="text-indigo-600"
                          checked={supportPlanData.academicSupport}
                          onChange={(e) => handleSupportPlanChange('academicSupport', e.target.checked)}
                        />
                        <span className="text-sm">Academic coaching and study strategies</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="text-indigo-600"
                          checked={supportPlanData.techSupport}
                          onChange={(e) => handleSupportPlanChange('techSupport', e.target.checked)}
                        />
                        <span className="text-sm">Technology assistance and digital literacy</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="text-indigo-600"
                          checked={supportPlanData.wellnessSupport}
                          onChange={(e) => handleSupportPlanChange('wellnessSupport', e.target.checked)}
                        />
                        <span className="text-sm">Wellness and stress management support</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Support Section */}
      {activeSection === 'contact-support' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📞 Getting Support: Contact Procedures</h2>
            <p className="text-gray-600 mb-6">
              Learn how to quickly access the right type of support for your specific needs at RTD Academy.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Quick Support Reference</h3>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg mr-3">📚</span>
                  Academic Support
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Primary Contact:</p>
                    <p className="text-sm text-gray-700">support@rtdacademy.com</p>
                    <p className="text-sm text-gray-700">403.351.0896</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">For help with:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Course content questions</li>
                      <li>• Assignment clarification</li>
                      <li>• Study strategies</li>
                      <li>• Grade concerns</li>
                      <li>• ISP requests</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Response Time:</p>
                    <p className="text-xs text-gray-600">24-48 hours during business days</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-lg mr-3">💻</span>
                  Technical Support
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Primary Contact:</p>
                    <p className="text-sm text-gray-700">tech@rtdacademy.com</p>
                    <p className="text-sm text-gray-700">403.351.0896 ext. 2</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">For help with:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Login and access issues</li>
                      <li>• Platform navigation</li>
                      <li>• Video/audio problems</li>
                      <li>• File upload/download</li>
                      <li>• Browser compatibility</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Response Time:</p>
                    <p className="text-xs text-gray-600">4-8 hours during business days</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg mr-3">💝</span>
                  Wellness Support
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Primary Contact:</p>
                    <p className="text-sm text-gray-700">wellness@rtdacademy.com</p>
                    <p className="text-sm text-gray-700">403.351.0896 ext. 3</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">For help with:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Stress management</li>
                      <li>• Mental health resources</li>
                      <li>• Work-life balance</li>
                      <li>• Crisis support</li>
                      <li>• Accessibility needs</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Response Time:</p>
                    <p className="text-xs text-gray-600">Same day for urgent, 24 hours for routine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📝 Support Request Form</h3>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-3">Practice Support Request</h4>
              <p className="text-sm text-gray-700 mb-4">
                Use this form to practice writing an effective support request. Good requests get faster, more helpful responses.
              </p>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type of Support Needed:</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded"
                      value={contactForm.supportType}
                      onChange={(e) => handleContactFormChange('supportType', e.target.value)}
                    >
                      <option value="">Select support type</option>
                      <option value="academic">Academic Support</option>
                      <option value="technical">Technical Support</option>
                      <option value="wellness">Wellness Support</option>
                      <option value="administrative">Administrative Issue</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Urgency Level:</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded"
                      value={contactForm.urgency}
                      onChange={(e) => handleContactFormChange('urgency', e.target.value)}
                    >
                      <option value="">Select urgency</option>
                      <option value="urgent">Urgent (same day response needed)</option>
                      <option value="normal">Normal (24-48 hour response)</option>
                      <option value="low">Low priority (when convenient)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Detailed Description:</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="Describe your issue clearly: What happened? What were you trying to do? What error messages did you see? What have you already tried?"
                    value={contactForm.description}
                    onChange={(e) => handleContactFormChange('description', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Contact Method:</label>
                  <div className="space-y-2">
                    {['Email response', 'Phone call', 'Video meeting', 'Text message'].map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="contact_method"
                          className="text-orange-600"
                          onChange={() => handleContactFormChange('preferredContact', method)}
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Tips for Effective Support Requests</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Include Specific Information:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Course name and lesson number</li>
                  <li>• Exact error messages or problems</li>
                  <li>• Screenshots if applicable</li>
                  <li>• Browser and device information</li>
                  <li>• Steps you've already tried</li>
                  <li>• Your student ID number</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication Best Practices:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Use clear, descriptive subject lines</li>
                  <li>• Be specific about what you need</li>
                  <li>• Indicate urgency level accurately</li>
                  <li>• Provide context and background</li>
                  <li>• Follow up appropriately</li>
                  <li>• Be patient and respectful</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Support Services Section */}
      {activeSection === 'support-services' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🛠️ Types of Support Services Available</h2>
            <p className="text-gray-600 mb-6">
              Discover the comprehensive support services available to help you succeed in your RTD Academy journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">📚 Academic Support Services</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Content Tutoring</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    One-on-one or small group sessions with subject matter experts for specific course content.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Mathematics: Algebra, Calculus, Statistics</li>
                    <li>• Sciences: Physics, Chemistry, Biology</li>
                    <li>• Languages: English, French, ESL support</li>
                    <li>• Social Studies: History, Geography, Civics</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Study Skills Coaching</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Learn effective study strategies and time management techniques for online learning success.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Note-taking strategies for digital content</li>
                    <li>• Memory techniques and retention methods</li>
                    <li>• Test preparation and anxiety management</li>
                    <li>• Goal setting and progress tracking</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Writing Support</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Assistance with all aspects of academic writing, from planning to final editing.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Essay structure and organization</li>
                    <li>• Research and citation guidance</li>
                    <li>• Grammar and style improvement</li>
                    <li>• Proofreading and editing techniques</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-700">💻 Technical Support Services</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Platform Navigation</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Help with using RTD Academy's learning management system and digital tools.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• LMS orientation and navigation</li>
                    <li>• Assignment submission procedures</li>
                    <li>• Gradebook and progress tracking</li>
                    <li>• Communication tools usage</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Device and Software Support</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Technical assistance with hardware and software requirements for online learning.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Browser optimization and troubleshooting</li>
                    <li>• Audio/video setup for virtual sessions</li>
                    <li>• File management and organization</li>
                    <li>• Security and privacy settings</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Digital Literacy Training</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Skill development for effective use of digital tools and online resources.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Internet research skills</li>
                    <li>• Digital communication etiquette</li>
                    <li>• Online safety and security</li>
                    <li>• Productivity software training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">💝 Wellness and Personal Support Services</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">Mental Health Support</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Resources and referrals for mental health and emotional wellbeing.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Stress management techniques</li>
                  <li>• Anxiety coping strategies</li>
                  <li>• Crisis intervention resources</li>
                  <li>• Counseling referrals</li>
                  <li>• Support group connections</li>
                </ul>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h4 className="font-semibold text-pink-800 mb-3">Life Balance Coaching</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Guidance for managing school, work, and personal responsibilities.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Work-life-school balance</li>
                  <li>• Family support strategies</li>
                  <li>• Financial planning resources</li>
                  <li>• Career guidance</li>
                  <li>• Transition support</li>
                </ul>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">Accessibility Services</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Accommodations and support for students with diverse learning needs.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Learning disability support</li>
                  <li>• Assistive technology setup</li>
                  <li>• Modified assessment options</li>
                  <li>• Alternative format materials</li>
                  <li>• Communication accommodations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Proactive Support Use Section */}
      {activeSection === 'proactive-help' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Proactive Use of Support Services</h2>
            <p className="text-gray-600 mb-6">
              Learn when and how to seek help proactively to prevent small challenges from becoming major obstacles.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Early Warning Signs: When to Seek Help</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Academic Warning Signs</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Grades dropping below your personal standards
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Spending excessive time on assignments without progress
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Falling behind on target dates consistently
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Avoiding difficult course material
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Feeling overwhelmed by course content
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Technical Warning Signs</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Frequent login or access problems
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Difficulty submitting assignments
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Audio/video issues during sessions
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Slow or unreliable internet connection
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Unfamiliarity with required software
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Personal/Wellness Warning Signs</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Increased stress or anxiety about school
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Difficulty balancing school with other responsibilities
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Loss of motivation or enthusiasm
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Sleep or health issues affecting studies
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Family or personal crises impacting school
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Communication Warning Signs</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Missing emails or announcements regularly
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Uncertainty about assignment requirements
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Feeling disconnected from instructors or peers
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Avoiding participation in class discussions
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Hesitating to ask questions when confused
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Proactive Help-Seeking Strategies</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Preventive Measures</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700 mb-1">Regular Check-ins</h5>
                    <p className="text-xs text-gray-600">Schedule weekly self-assessments to identify challenges early</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700 mb-1">Support Relationship Building</h5>
                    <p className="text-xs text-gray-600">Establish connections with instructors and support staff early</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700 mb-1">Resource Familiarization</h5>
                    <p className="text-xs text-gray-600">Learn about available services before you need them</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-green-700 mb-1">Skill Development</h5>
                    <p className="text-xs text-gray-600">Proactively develop study and technical skills</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">When to Act</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-1">Immediately</h5>
                    <p className="text-xs text-gray-600">Technical failures, health crises, family emergencies</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-1">Within 1-2 Days</h5>
                    <p className="text-xs text-gray-600">Confusion about assignments, login problems, stress increases</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-1">Within a Week</h5>
                    <p className="text-xs text-gray-600">Falling behind schedule, difficulty with content, motivation issues</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm text-blue-700 mb-1">Before It Becomes a Problem</h5>
                    <p className="text-xs text-gray-600">Anticipating challenges, skill gaps, upcoming busy periods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Success Stories: Proactive Support in Action</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Emma's Math Success:</h4>
                <p className="text-gray-700 mb-2">
                  Emma realized she was struggling with algebra concepts in Week 2. Instead of waiting, she immediately 
                  contacted academic support and set up weekly tutoring sessions.
                </p>
                <p className="text-green-700 font-medium">Result: Improved from 65% to 85% by the end of the course</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Jordan's Tech Preparedness:</h4>
                <p className="text-gray-700 mb-2">
                  Before starting his course, Jordan scheduled a tech orientation session to learn the LMS and test his setup.
                </p>
                <p className="text-green-700 font-medium">Result: No technical delays throughout the entire course</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* E-Learning Reflection Section */}
      {activeSection === 'reflection' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🤔 E-Learning Experience Reflection</h2>
            <p className="text-gray-600 mb-6">
              Reflect on your journey through this orientation course and prepare for your upcoming academic studies.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">📝 Personal Learning Reflection</h3>
            
            {!reflectionData.completed ? (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-3">Instructions</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Complete this comprehensive reflection on your e-learning experience. Your responses will be analyzed 
                    by AI to provide personalized feedback about your readiness for upcoming courses. Be honest and specific 
                    in your responses.
                  </p>
                  <p className="text-xs text-indigo-600">
                    Minimum requirements: 100 words for e-learning experience, 50 words for course connections
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>Describe your overall e-learning experience during this orientation course:</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="4"
                      placeholder="Reflect on what you learned, how you adapted to online learning, what surprised you, what was challenging, and what you enjoyed..."
                      value={reflectionData.elearningExperience}
                      onChange={(e) => handleReflectionChange('elearningExperience', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reflectionData.elearningExperience.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>What challenges did you face during this orientation course?</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Describe any technical difficulties, time management issues, content challenges, or other obstacles you encountered..."
                      value={reflectionData.challengesFaced}
                      onChange={(e) => handleReflectionChange('challengesFaced', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>What strategies or approaches worked best for you?</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Share the study methods, time management techniques, or learning strategies that helped you succeed..."
                      value={reflectionData.successfulStrategies}
                      onChange={(e) => handleReflectionChange('successfulStrategies', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>How have you grown personally through this experience?</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Reflect on new skills you've developed, confidence you've gained, or perspectives that have changed..."
                      value={reflectionData.personalGrowth}
                      onChange={(e) => handleReflectionChange('personalGrowth', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>How does this experience connect to your upcoming course and academic goals?</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Explain how this orientation prepares you for your next course, what skills you'll apply, and how it fits your educational objectives..."
                      value={reflectionData.connectionsToCourse}
                      onChange={(e) => handleReflectionChange('connectionsToCourse', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reflectionData.connectionsToCourse.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <strong>What are your goals and expectations for your next course?</strong>
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Share your academic goals, personal objectives, and what you hope to achieve in your upcoming studies..."
                      value={reflectionData.futureGoals}
                      onChange={(e) => handleReflectionChange('futureGoals', e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={submitReflection}
                    disabled={reflectionData.elearningExperience.length < 100 || reflectionData.connectionsToCourse.length < 50}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit Reflection for AI Analysis
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-4 text-center">✅ Reflection Analysis Complete</h4>
                
                {showReflectionFeedback && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                      <h5 className="font-semibold text-lg text-gray-800 mb-3">🤖 AI Analysis of Your Reflection</h5>
                      
                      <div className="space-y-3 text-sm">
                        <div className="bg-blue-50 rounded p-3">
                          <p className="font-medium text-blue-800 mb-1">Learning Readiness Assessment:</p>
                          <p className="text-gray-700">
                            Based on your reflection, you demonstrate strong self-awareness and adaptability - key traits 
                            for successful online learning. Your ability to identify both challenges and successful strategies 
                            shows metacognitive skills that will serve you well in future courses.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded p-3">
                          <p className="font-medium text-green-800 mb-1">Strengths Identified:</p>
                          <p className="text-gray-700">
                            Your reflection reveals good problem-solving abilities and willingness to adapt. You've shown 
                            that you can learn from challenges and apply new strategies effectively.
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 rounded p-3">
                          <p className="font-medium text-yellow-800 mb-1">Recommendations for Future Success:</p>
                          <p className="text-gray-700">
                            Continue to use the successful strategies you've identified. Remember to seek help proactively 
                            when facing new challenges, and maintain the positive attitude toward learning that comes through 
                            in your reflection.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 rounded p-3">
                          <p className="font-medium text-purple-800 mb-1">Course Connection Analysis:</p>
                          <p className="text-gray-700">
                            Your understanding of how this orientation connects to your upcoming studies shows good academic 
                            planning. You're well-prepared to transfer these foundational skills to subject-specific content.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
                      <p className="text-lg font-medium text-gray-800">
                        🎉 Congratulations on completing your thoughtful reflection! 
                        You're ready to begin your academic journey with confidence.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Course Readiness Section */}
      {activeSection === 'course-readiness' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🚀 Your Course Readiness Assessment</h2>
            <p className="text-gray-600 mb-6">
              Complete this final readiness checklist to ensure you're fully prepared to begin your first academic course at RTD Academy.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-emerald-700">📋 Readiness Checklist</h3>
            
            <div className="space-y-4">
              {Object.entries(readinessChecklist).map(([key, completed]) => {
                const checklistItems = {
                  understandRewritePolicy: {
                    title: "I understand RTD's rewrite policy and requirements",
                    description: "One rewrite per course, all exams completed, practice test threshold"
                  },
                  knowSupportContacts: {
                    title: "I know how to contact support for academic, technical, and wellness help",
                    description: "Academic: support@rtdacademy.com, Tech: tech@rtdacademy.com, Wellness: wellness@rtdacademy.com"
                  },
                  familiarWithISP: {
                    title: "I understand how to access Instructional Support Plans if needed",
                    description: "Request process, assessment, plan development, and implementation"
                  },
                  practiceTestCompleted: {
                    title: "I've completed practice tests and understand their importance",
                    description: "70% threshold required before rewrite requests"
                  },
                  technologyTested: {
                    title: "My technology setup is tested and working",
                    description: "Internet, device, browser, LMS access, audio/video for proctoring"
                  },
                  studySpaceReady: {
                    title: "I have a designated study space prepared",
                    description: "Quiet, organized, with necessary materials and minimal distractions"
                  },
                  scheduleCreated: {
                    title: "I've created a realistic study schedule",
                    description: "Regular study times, target dates, check-ins, and break planning"
                  },
                  goalsSet: {
                    title: "I've set clear academic goals for my first course",
                    description: "Specific, measurable objectives and motivation for learning"
                  }
                };

                const item = checklistItems[key];
                return (
                  <div key={key} className={`border-2 rounded-lg p-4 transition-all ${
                    completed ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 text-emerald-600 text-lg"
                        checked={completed}
                        onChange={() => handleChecklistChange(key)}
                      />
                      <div className="flex-grow">
                        <h4 className={`font-semibold mb-1 ${completed ? 'text-green-800' : 'text-gray-700'}`}>
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      {completed && (
                        <span className="text-green-600 text-xl">✅</span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-emerald-50 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-800 mb-2">Your Readiness Score</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-grow bg-gray-200 rounded-full h-6">
                  <div 
                    className={`h-6 rounded-full transition-all flex items-center justify-center text-white text-sm font-medium ${
                      calculateReadinessPercentage() >= 80 ? 'bg-green-500' : 
                      calculateReadinessPercentage() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${calculateReadinessPercentage()}%` }}
                  >
                    {calculateReadinessPercentage()}%
                  </div>
                </div>
                <span className="text-emerald-700 font-semibold">
                  {calculateReadinessPercentage()}% Ready
                </span>
              </div>
              
              <div className="mt-3">
                {calculateReadinessPercentage() >= 80 && (
                  <p className="text-green-700 font-medium">
                    🎉 Excellent! You're well-prepared to begin your first course.
                  </p>
                )}
                {calculateReadinessPercentage() >= 60 && calculateReadinessPercentage() < 80 && (
                  <p className="text-yellow-700 font-medium">
                    👍 Good progress! Complete a few more items to be fully ready.
                  </p>
                )}
                {calculateReadinessPercentage() < 60 && (
                  <p className="text-red-700 font-medium">
                    📚 Keep working through the checklist to ensure your success.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-center">🌟 You're Ready to Begin Your Academic Journey!</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold mb-3">What You've Accomplished:</h4>
                <ul className="space-y-2 text-emerald-100">
                  <li>✅ Mastered RTD Academy's policies and procedures</li>
                  <li>✅ Learned to navigate the support systems</li>
                  <li>✅ Developed e-learning skills and strategies</li>
                  <li>✅ Created personal learning plans</li>
                  <li>✅ Built confidence in online education</li>
                  <li>✅ Prepared for academic success</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold mb-3">Your Next Steps:</h4>
                <div className="space-y-2 text-emerald-100">
                  <p>1. 📚 Begin your first academic course with confidence</p>
                  <p>2. 🎯 Apply the learning strategies you've developed</p>
                  <p>3. 🤝 Use support services proactively when needed</p>
                  <p>4. 📈 Track your progress and celebrate achievements</p>
                  <p>5. 🌱 Continue growing as an independent learner</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-6">
              <p className="text-xl font-medium text-center mb-4">
                🎓 Welcome to RTD Academy - Where Your Educational Dreams Take Flight!
              </p>
              <p className="text-lg text-center">
                You've completed your orientation with flying colors. Now it's time to dive into your chosen subject 
                and discover the amazing things you can achieve through dedicated online learning. 
                Remember: every expert was once a beginner, and every journey starts with a single step. 
                You've taken that step, and we're here to support you every step of the way!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Final Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Complete this comprehensive assessment covering rewrite policies, support services, and course readiness.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="10_exams_rewrites_student_support_practice"
            cloudFunctionName="course4_10_exams_rewrites_student_support_aiQuestion"
            title="Support Services & Course Readiness Assessment"
            theme="emerald"
          />
        </section>
      )}

      {/* Final Encouragement Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🎉 Congratulations on Completing Your RTD Academy Orientation!</h2>
          <p className="text-xl mb-6">You're now equipped with everything you need to succeed in your educational journey</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Knowledge Gained</h3>
            <p className="text-emerald-100">
              You've mastered RTD Academy's systems, policies, and support services
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💪</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Skills Developed</h3>
            <p className="text-emerald-100">
              You've built essential e-learning skills and study strategies
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready for Success</h3>
            <p className="text-emerald-100">
              You're prepared to excel in your first academic course
            </p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">🚀 Your Journey Starts Now!</h3>
          <p className="text-lg text-center mb-4">
            As you begin your first course, remember that you're not just learning subject content - 
            you're developing skills that will serve you throughout your academic and professional life. 
            Online learning requires independence, self-motivation, and resilience, and you've already demonstrated these qualities.
          </p>
          <p className="text-lg text-center">
            Trust in your preparation, embrace the challenges ahead, and remember that every successful student 
            was once where you are now. Your educational goals are within reach, and RTD Academy is here to support 
            you every step of the way. Welcome to the next chapter of your learning adventure!
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-white/20 rounded-full px-8 py-4">
            <span className="text-2xl">🌟</span>
            <span className="text-xl font-semibold">You've Got This!</span>
            <span className="text-2xl">🌟</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExamsRewritesStudentSupportResources;