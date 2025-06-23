import React, { useState, useEffect } from 'react';
import { AIMultipleChoiceQuestion, StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const ExamsRewritesStudentSupportResources = ({ courseId, itemId, activeItem }) => {
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
    familiarWithIPP: false,
    practiceTestCompleted: false,
    technologyTested: false,
    studySpaceReady: false,
    scheduleCreated: false,
    goalsSet: false
  });

  const [showReflectionFeedback, setShowReflectionFeedback] = useState(false);

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

  const allQuestionsCompleted = questionsCompleted.question1 && questionsCompleted.question2 && questionsCompleted.question3 && 
    questionsCompleted.question4 && questionsCompleted.question5 && questionsCompleted.question6 && 
    questionsCompleted.question7 && questionsCompleted.question8;


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
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
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
            { id: 'ipp-support', label: 'Individual Program Plans (IPP)' },
            { id: 'contact-support', label: 'Getting Support' },
            { id: 'proactive-help', label: 'Proactive Support Use' },
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
                        If informal discussion doesn't resolve the issue, submit a formal written appeal to the principal.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Required documentation:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
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
                        The principal will conduct an investigation and review the appeal.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Investigation process:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Review of original work and marking</li>
                          <li>• Comparison with course standards</li>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      )}

      {/* IPP Support Section */}
      {activeSection === 'ipp-support' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📚 Individual Program Plans (IPP)</h2>
            <p className="text-gray-600 mb-6">
              If you have an IPP, RTD Academy will strive to provide all documented accommodations to support your learning success.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🎯 Understanding Individual Program Plans</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">What is an IPP?</h4>
                <p className="text-sm text-gray-700 mb-3">
                  An Individual Program Plan (IPP) is a documented plan that outlines specific learning accommodations 
                  and support strategies for students with identified learning needs.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Why students might have an IPP:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Learning disabilities or differences</li>
                    <li>• Visual or auditory impairments</li>
                    <li>• Physical disabilities</li>
                    <li>• Attention disorders (ADHD/ADD)</li>
                    <li>• Medical conditions affecting learning</li>
                    <li>• Processing or cognitive challenges</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Common IPP Accommodations</h4>
                <p className="text-sm text-gray-700 mb-3">
                  RTD Academy provides various accommodations based on your documented IPP to ensure equal access to education.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Possible accommodations include:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Extended time for assessments and exams</li>
                    <li>• Frequent breaks during testing</li>
                    <li>• Use of screen readers for visual impairments</li>
                    <li>• Large print materials and assessments</li>
                    <li>• Alternative response formats</li>
                    <li>• Reduced distractions testing environment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📋 How to Access IPP Accommodations</h3>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">During Your Orientation Meeting</h4>
                <p className="text-sm text-gray-700 mb-3">
                  To access accommodations, discuss your IPP during your orientation meeting. This ensures we can implement your accommodations from the start of your course.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">What to bring to orientation:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Current IPP documentation</li>
                    <li>• List of required accommodations</li>
                    <li>• Any assistive technology requirements</li>
                    <li>• Questions about online implementation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Complex Accommodations</h4>
                <p className="text-sm text-gray-700 mb-3">
                  If your accommodations are more complex, or you are unsure how they will work in an online environment, please request a meeting with an administrator.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Examples of complex accommodations:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Specialized software requirements</li>
                    <li>• Multiple accommodation needs</li>
                    <li>• Physical accessibility considerations</li>
                    <li>• Alternative assessment formats</li>
                    <li>• Communication assistance needs</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Diploma Exam Documentation</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Important:</strong> For diploma exams, we must have documentation of all accommodations. This documentation must be submitted well in advance of your exam date.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-xs font-medium mb-2">Diploma exam requirements:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Official IPP documentation</li>
                    <li>• Alberta Education approval for accommodations</li>
                    <li>• Advance submission deadlines</li>
                    <li>• Specific accommodation forms</li>
                  </ul>
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
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg mr-3">📚</span>
                  Academic Support
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Primary Contact:</p>
                    <p className="text-sm text-gray-700">Your course teacher</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">For help with:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Course content questions</li>
                      <li>• Assignment clarification</li>
                      <li>• Study strategies</li>
                      <li>• Grade concerns</li>
                      <li>• IPP accommodation questions</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-1">Response Time:</p>
                    <p className="text-xs text-gray-600">24-48 hours</p>
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
                    <p className="text-sm text-gray-700">Your course teacher</p>
                    <p className="text-xs font-medium mb-1 mt-2">Secondary Contact:</p>
                    <p className="text-sm text-gray-700">Stan Scott - stan@rtdacademy.com</p>
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
                    <p className="text-xs text-gray-600">24-48 hours</p>
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
                  <li>• <strong>Screenshots or video</strong> for technical help</li>
                  <li>• Browser and device information</li>
                  <li>• Steps you've already tried</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication Best Practices:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Use clear, descriptive subject lines</li>
                  <li>• Be specific about what you need</li>
                  <li>• Provide context and background</li>
                  <li>• Follow up appropriately</li>
                  <li>• Be patient and respectful</li>
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
                      Feeling disconnected from instructors
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
                cloudFunctionName="course4_10_exams_rewrites_question1"
                title="Rewrite Policy Understanding"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question1: true }));
                  setQuestionResults(prev => ({...prev, question1: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 1 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question2"
                title="Support Services Knowledge"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question2: true }));
                  setQuestionResults(prev => ({...prev, question2: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 2 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question3"
                title="Student Support Resources"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question3: true }));
                  setQuestionResults(prev => ({...prev, question3: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 3 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question4"
                title="Academic Planning Requirements"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question4: true }));
                  setQuestionResults(prev => ({...prev, question4: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 4 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question5"
                title="Exam Support and Accommodations"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question5: true }));
                  setQuestionResults(prev => ({...prev, question5: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 5 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question6"
                title="Student Readiness Assessment"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question6: true }));
                  setQuestionResults(prev => ({...prev, question6: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 6 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question7"
                title="Scenario: Requesting Support"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question7: true }));
                  setQuestionResults(prev => ({...prev, question7: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {currentQuestionIndex === 7 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                cloudFunctionName="course4_10_exams_rewrites_question8"
                title="Scenario: Exam Rewrite Decision"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  setQuestionsCompleted(prev => ({ ...prev, question8: true }));
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

      {/* Final Encouragement Section - Only show when all questions are completed */}
      {allQuestionsCompleted && (
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-10">
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
      )}
    </div>
  );
};

export default ExamsRewritesStudentSupportResources;