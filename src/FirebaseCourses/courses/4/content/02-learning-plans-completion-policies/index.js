import React, { useState, useEffect } from 'react';
import { AIMultipleChoiceQuestion, StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const LearningPlansCourseCompletionDiplomaExamPolicies = ({ courseId, itemId, activeItem, onNavigateToLesson, onNavigateToNext }) => {
  const [activeSection, setActiveSection] = useState('completion');
  const [learningPlan, setLearningPlan] = useState({
    studyDays: [],
    studyTimes: '',
    weeklyHours: '',
    goals: '',
    challenges: '',
    workLocation: []
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [fillInBlanks, setFillInBlanks] = useState({});
  const [mcAnswers, setMcAnswers] = useState({});
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

  const handleLearningPlanChange = (field, value) => {
    setLearningPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setLearningPlan(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };


  const handleFillInBlank = (questionId, value) => {
    setFillInBlanks(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoice = (questionId, value) => {
    setMcAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
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

  // Note: Lesson completion is now tracked automatically through assessment submissions
  // No manual markCompleted call needed - the gradebook system handles this

  const handleNextLesson = () => {
    console.log('🚀 Navigating to next lesson...', {
      onNavigateToNext: !!onNavigateToNext,
      onNavigateToLesson: !!onNavigateToLesson
    });
    
    if (onNavigateToNext) {
      console.log('✅ Using onNavigateToNext()');
      onNavigateToNext();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (onNavigateToLesson) {
      console.log('✅ Using onNavigateToLesson(lesson_time_management)');
      onNavigateToLesson('lesson_time_management');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      console.warn('⚠️ Navigation functions not provided, using fallback navigation');
      
      if (window.courseNavigate) {
        console.log('🔄 Using window.courseNavigate fallback');
        window.courseNavigate('lesson_time_management');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        console.log('🔄 Using page navigation fallback (will cause refresh)');
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace('02-learning-plans-completion-policies', '03-time-management-staying-active');
        window.location.href = newPath;
      }
    }
  };

  const checkFillInBlanks = () => {
    const correctAnswers = {
      q1: 'one year',
      q2: 'section 1',
      q3: 'mypass',
      q4: 'locked',
      q5: 'withdrawn'
    };
    
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (fillInBlanks[key] && fillInBlanks[key].toLowerCase().includes(correctAnswers[key])) {
        score++;
      }
    });
    
    return { score, total: Object.keys(correctAnswers).length };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Learning Plans, Course Completion & Diploma Exam Policies</h1>
        <p className="text-xl mb-6">Master your path to success with personalized planning and clear expectations</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Create a personal learning plan, understand course completion timelines and withdrawal policies, 
            learn MyPass registration procedures, and recognize the importance of staying active in your studies.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'completion', label: 'Course Completion' },
            { id: 'planning', label: 'Personal Learning Plan' },
            { id: 'withdrawal', label: 'Withdrawal & MyPass' },
            { id: 'mypass', label: 'MyPass & Diploma Exams' },
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

      {/* Personal Learning Plan Section */}
      {activeSection === 'planning' && (
        <section className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">📝 Creating Your Personal Learning Plan</h2>
            <p className="text-gray-700 mb-4">
              A personal learning plan is your roadmap to success at RTD Academy. It helps you organize your time, 
              set realistic goals, and establish routines that work with your lifestyle and commitments.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🏗️ Building Your Learning Plan</h3>
            
            <div className="space-y-6">
              {/* Study Schedule */}
              <div>
                <h4 className="font-semibold mb-3">📅 When will you study?</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Best days for studying:</label>
                    <div className="space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="text-blue-600"
                            checked={learningPlan.studyDays.includes(day)}
                            onChange={() => handleCheckboxChange('studyDays', day)}
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred study times:</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded"
                        value={learningPlan.studyTimes}
                        onChange={(e) => handleLearningPlanChange('studyTimes', e.target.value)}
                      >
                        <option value="">Select your preferred time</option>
                        <option value="early-morning">Early morning (6-9 AM)</option>
                        <option value="morning">Morning (9 AM-12 PM)</option>
                        <option value="afternoon">Afternoon (12-5 PM)</option>
                        <option value="evening">Evening (5-9 PM)</option>
                        <option value="late-evening">Late evening (9 PM+)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Weekly study goal (hours):</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded" 
                        placeholder="e.g., 10"
                        min="1" 
                        max="40"
                        value={learningPlan.weeklyHours}
                        onChange={(e) => handleLearningPlanChange('weeklyHours', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Location */}
              <div>
                <h4 className="font-semibold mb-3">📍 Where will you study?</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {['Home office/desk', 'Kitchen/dining table', 'Library', 'Coffee shop', 'Bedroom', 'Other quiet space'].map(location => (
                    <label key={location} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="text-blue-600"
                        checked={learningPlan.workLocation.includes(location)}
                        onChange={() => handleCheckboxChange('workLocation', location)}
                      />
                      <span className="text-sm">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Goals and Challenges */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">🎯 Your learning goals:</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="What do you hope to achieve in this course?"
                    value={learningPlan.goals}
                    onChange={(e) => handleLearningPlanChange('goals', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">⚠️ Potential challenges:</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="What might make studying difficult? (work schedule, family commitments, etc.)"
                    value={learningPlan.challenges}
                    onChange={(e) => handleLearningPlanChange('challenges', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plan Summary */}
          {(learningPlan.studyDays.length > 0 || learningPlan.goals) && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">📋 Your Learning Plan Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  {learningPlan.studyDays.length > 0 && (
                    <p><strong>Study Days:</strong> {learningPlan.studyDays.join(', ')}</p>
                  )}
                  {learningPlan.studyTimes && (
                    <p><strong>Preferred Time:</strong> {learningPlan.studyTimes.replace('-', ' ')}</p>
                  )}
                  {learningPlan.weeklyHours && (
                    <p><strong>Weekly Hours:</strong> {learningPlan.weeklyHours} hours</p>
                  )}
                </div>
                <div>
                  {learningPlan.workLocation.length > 0 && (
                    <p><strong>Study Locations:</strong> {learningPlan.workLocation.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Course Completion Section */}
      {activeSection === 'completion' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⏰ Course Completion Timeline & Expectations</h2>
            <p className="text-gray-600 mb-6">
              Understanding RTD Academy's completion expectations will help you plan your learning journey effectively.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">📅 Completion Expectation</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Students are expected to complete their course by <strong>the date they submit</strong> when registering. 
                    This gives you control over your timeline while ensuring you meet your personal educational goals.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium mb-2">A course is complete when you have finished:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Course content and lessons</li>
                      <li>• Assignments and projects</li>
                      <li>• Section exams (3 total)</li>
                      <li>• Diploma exam (if applicable)</li>
                      <li>• One re-write exam (optional)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🤝 Extensions Available</h4>
                  <p className="text-gray-700 text-sm">
                    Students may apply for extensions for up to one year after their original start date under special circumstances. 
                    Contact your instructor or RTD administration if you anticipate needing more time due to:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Medical reasons</li>
                    <li>• Family emergencies</li>
                    <li>• Significant life changes</li>
                    <li>• Other extenuating circumstances</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">⏱️ Time Requirements for 5-Credit Course</h4>
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Total Required Hours: 125 hours</p>
                    <p className="text-xs text-blue-600 mt-1">Alberta Education standard: 25 hours per credit × 5 credits</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">1 Month Timeline</span>
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded font-semibold">6.25 hrs/day</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">2 Month Timeline</span>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded font-semibold">3.1 hrs/day</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">4 Month Timeline</span>
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded font-semibold">1.6 hrs/day</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">8 Month Timeline</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-semibold">0.8 hrs/day</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700"><strong>Note:</strong> Based on 5-day work week (Mon-Fri). Weekend study can reduce daily requirements.</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Success Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Track your progress regularly</li>
                    <li>• Communicate with instructors about your pace</li>
                    <li>• Plan for busy periods (work, holidays, etc.)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </section>
      )}

      {/* Withdrawal & MyPass Section */}
      {activeSection === 'withdrawal' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🚪 Withdrawal Deadlines & MyPass Reporting</h2>
            <p className="text-gray-600 mb-6">
              Understanding withdrawal policies and MyPass reporting helps you make informed decisions about your education.
              </p><p><strong>Note: These policies apply to Non-Primary, Homeschool, and Summer School students.</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">✅ Before Section 1 Exam</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students who choose to withdraw <strong>before completing the Section 1 exam</strong> will have 
                    their enrollment recorded as a <strong>Withdrawal (WDRW)</strong> in MyPass.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-green-800">What this means:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• No grade will be submitted to your transcript</li>
                      <li>• Can re-register in future terms</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">❌ After Section 1 Exam</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    If a student withdraws <strong>after completing the Section 1 exam</strong>, RTD Math Academy 
                    will submit a final grade to MyPass.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-red-800">This grade will include:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Zeros for any incomplete or missing coursework</li>
                      <li>• A final grade that may reflect a low or failing mark</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">🏛️ What is MyPass?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>MyPass</strong> is Alberta's official student record system interface. All grades, 
                    withdrawals, and academic records are accessible through MyPass.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium mb-2">MyPass tracks:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Course enrollments and withdrawals</li>
                      <li>• Final grades and credits earned</li>
                      <li>• Diploma exam scores</li>
                      <li>• Academic transcripts</li>
                      <li>• Graduation requirements</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <a 
                      href="https://public.education.alberta.ca/PASI/mypass/welcome" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      → Access MyPass Portal
                    </a>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-700 mb-2">📢 Additional MyPass Reporting Situations</h4>
                  <p className="text-sm text-gray-700 mb-2">A final grade will also be submitted if a student:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Reaches the end of the term without applying for extension</li>
                    <li>• Has reached the 1 year maximum extension from their original start date</li>
                    <li>• Is unenrolled due to inactivity with no communication</li>
                  </ul>
                  <p className="text-xs text-orange-600 mt-2 italic">
                    Note: All grades are submitted at the end of the term, but students may continue into the next 
                    term to finish their course and improve their grade.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">💡 Making Smart Withdrawal Decisions</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Consider withdrawing early if:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• You haven't started significant coursework</li>
                  <li>• Life circumstances have changed dramatically</li>
                  <li>• You want to take the course at a different time</li>
                  <li>• You're not ready to commit the required time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Stay enrolled if:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• You've completed Section 1 exam successfully</li>
                  <li>• You're making steady progress</li>
                  <li>• Challenges are temporary and manageable</li>
                  <li>• Support is available to help you succeed</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MyPass Registration Section */}
      {activeSection === 'mypass' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎓 MyPass Registration & Diploma Exam Management</h2>
            <p className="text-gray-600 mb-6">
              Learn how to register for diploma exams, manage your MyPass account, and understand your responsibilities.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📋 What is MyPass?</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">🎯 MyPass Overview</h4>
                <p className="text-sm text-gray-700 mb-3">
                  MyPass is Alberta Education's official portal for diploma exam registration and management. 
                  <strong>All students in diploma courses are required to register through MyPass.</strong>
                </p>
                
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">MyPass allows you to:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Register for diploma exams</li>
                    <li>• Choose exam locations</li>
                    <li>• Pay rewrite exam fees</li>
                    <li>• Reschedule or cancel exams</li>
                    <li>• View exam results</li>
                    <li>• Access your diploma exam history</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📍 RTD Academy Exam Locations</h4>
                <p className="text-sm text-gray-700 mb-3">
                  RTD Math Academy facilitates diploma exam sittings in Calgary and Edmonton. Students also have 
                  the ability to book exams at other Alberta locations.
                </p>
                
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Your options include:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• RTD Calgary location</li>
                    <li>• RTD Edmonton location</li>
                    <li>• Public school divisions near you</li>
                    <li>• Other approved testing centers</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    You'll receive detailed location information well in advance of examination dates.
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-red-800">🚨 Diploma Exam Withdrawal Responsibility</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-red-700 mb-2">If You Withdraw from a Diploma Course:</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>It is YOUR responsibility to cancel your diploma exam registration in MyPass. </strong> 
                  RTD Academy cannot do this for you.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Important steps:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Log into MyPass immediately</li>
                    <li>• Cancel your exam registration</li>
                    <li>• Check cancellation deadlines</li>
                    <li>• Keep confirmation of cancellation</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <div className="bg-yellow-100 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    💡 If you need to reschedule or cancel your exam registration, contact MyPass directly for assistance. Note: Rewrite fees may apply for rescheduling.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">💰 Exam Registration & Rewrite Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Initial Exam Registration:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• No fee for your first attempt at diploma exams</li>
                  <li>• Registration completed directly through MyPass</li>
                  <li>• RTD Academy does not handle exam registrations</li>
                  <li>• Register early for best location and time options</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Exam Rewrites:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Rewrite fees apply and are paid directly through MyPass</li>
                  <li>• Multiple sessions available throughout the year</li>
                  <li>• Same registration process as initial exams</li>
                  
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
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Learning Plans & Policies</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding with realistic scenarios and questions about course policies and procedures.
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
                    cloudFunctionName="course4_02_learning_plans_question1"
                    title="Scenario: Alex's Section 1 Withdrawal"
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
                    cloudFunctionName="course4_02_learning_plans_question2"
                    title="Scenario: Maria's MyPass Registration"
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
                    cloudFunctionName="course4_02_learning_plans_question3"
                    title="Scenario: Jordan's Inactivity Situation"
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
                    cloudFunctionName="course4_02_learning_plans_question4"
                    title="Course Completion Timeline"
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
                    cloudFunctionName="course4_02_learning_plans_question5"
                    title="Section 1 Withdrawal Policy"
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
                    cloudFunctionName="course4_02_learning_plans_question6"
                    title="Diploma Exam Registration"
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
                    cloudFunctionName="course4_02_learning_plans_question7"
                    title="Course Access Lock Policy"
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
                    cloudFunctionName="course4_02_learning_plans_question8"
                    title="Consequences of Not Responding"
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
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Lesson Complete! You're Ready to Plan Your Success</h2>
          
          <div className="text-center mb-6">
            <p className="text-lg mb-4">
              You've mastered RTD Academy's policies on learning plans, course completion, withdrawal procedures, and MyPass registration.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <p className="text-base">
                Next, you'll learn effective time management strategies and how to stay active and engaged in your asynchronous courses.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
              <ul className="space-y-2 text-indigo-100">
                <li>✅ How to create a personalized learning plan</li>
                <li>✅ Course completion timeline and one-year expectation</li>
                <li>✅ Withdrawal deadlines and PASI reporting rules</li>
                <li>✅ MyPass registration and diploma exam management</li>
                <li>✅ Consequences of inactivity and how to stay engaged</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Your Action Items:</h3>
              <div className="space-y-2 text-indigo-100">
                <p>1. 📅 Implement your weekly study schedule</p>
                <p>2. 📧 Set up email reminders for check-ins</p>
                <p>3. 💻 Create your MyPass account (if taking diploma courses)</p>
                <p>4. 📱 Save RTD contact information</p>
                <p>5. 🎯 Review your learning goals regularly</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleNextLesson}
              className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Continue to Next Lesson →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default LearningPlansCourseCompletionDiplomaExamPolicies;