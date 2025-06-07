import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const LearningPlansCourseCompletionDiplomaExamPolicies = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('planning');
  const [learningPlan, setLearningPlan] = useState({
    studyDays: [],
    studyTimes: '',
    weeklyHours: '',
    goals: '',
    challenges: '',
    workLocation: []
  });

  // Weekly Planner Drag & Drop State
  const [plannerItems, setPlannerItems] = useState({
    activities: [
      { id: 'course-reading', text: 'Course Reading & Content Review', color: 'bg-blue-100 text-blue-800' },
      { id: 'assignments', text: 'Assignment Work', color: 'bg-green-100 text-green-800' },
      { id: 'quiz-prep', text: 'Quiz Preparation', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'exam-study', text: 'Exam Study Sessions', color: 'bg-red-100 text-red-800' },
      { id: 'check-ins', text: 'Monday Check-in & Friday Reflection', color: 'bg-purple-100 text-purple-800' },
      { id: 'office-hours', text: 'Virtual Office Hours', color: 'bg-indigo-100 text-indigo-800' }
    ],
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    }
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [fillInBlanks, setFillInBlanks] = useState({});
  const [mcAnswers, setMcAnswers] = useState({});

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

  // Drag & Drop Functions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (draggedItem) {
      setPlannerItems(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: [...prev.schedule[day], { ...draggedItem, id: `${draggedItem.id}-${Date.now()}` }]
        }
      }));
      setDraggedItem(null);
    }
  };

  const removeFromSchedule = (day, itemId) => {
    setPlannerItems(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].filter(item => item.id !== itemId)
      }
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
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8">
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
            { id: 'planning', label: 'Personal Learning Plan' },
            { id: 'completion', label: 'Course Completion' },
            { id: 'withdrawal', label: 'Withdrawal & PASI' },
            { id: 'mypass', label: 'MyPass & Diploma Exams' },
            { id: 'activity', label: 'Staying Active' },
            { id: 'planner', label: 'Weekly Planner' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🎯 One Year Completion Rule</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">📅 The One Year Timeline</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Students are expected to complete their course within <strong>one year of enrollment</strong>. 
                    This gives you flexibility while ensuring steady progress toward your educational goals.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium mb-2">Your timeline includes:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Course content and lessons</li>
                      <li>• Assignments and projects</li>
                      <li>• Section exams (3 total)</li>
                      <li>• Diploma exam (if applicable)</li>
                      <li>• Any required rewrites</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🤝 Extensions Available</h4>
                  <p className="text-gray-700 text-sm">
                    Extensions may be granted under special circumstances. Contact your instructor or 
                    RTD administration if you anticipate needing more time due to:
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
                  <h4 className="font-semibold mb-3">📊 Typical Course Progression</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">Month 1-3: Course Content</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">25%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">Month 4-6: Assignments & Section 1</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">50%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">Month 7-9: Section 2 & Advanced Content</span>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">75%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">Month 10-12: Section 3 & Diploma Prep</span>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">100%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Success Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Break the year into manageable monthly goals</li>
                    <li>• Track your progress regularly</li>
                    <li>• Communicate with instructors about your pace</li>
                    <li>• Plan for busy periods (work, holidays, etc.)</li>
                    <li>• Use summer months strategically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ What "Course Completion" Means</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Required for Completion:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    All course lessons and content reviewed
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    All assignments submitted on time
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Three section exams completed
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Diploma exam taken (for diploma courses)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Final grade calculated and submitted to PASI
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Your Course Progress:</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Track your progress through your YourWay Portal and course dashboard. 
                  You'll see completion percentages for:
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Lesson completion</li>
                  <li>• Assignment submissions</li>
                  <li>• Quiz performance</li>
                  <li>• Exam scores</li>
                  <li>• Overall course grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Withdrawal & PASI Section */}
      {activeSection === 'withdrawal' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🚪 Withdrawal Deadlines & PASI Reporting</h2>
            <p className="text-gray-600 mb-6">
              Understanding withdrawal policies and PASI reporting helps you make informed decisions about your education.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">⚠️ Critical Withdrawal Timeline</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">✅ Before Section 1 Exam</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students who choose to withdraw <strong>before completing the Section 1 exam</strong> will have 
                    their enrollment recorded as a <strong>Withdrawal (WDRW)</strong> in PASI.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-green-800">What this means:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• No grade will be submitted to your transcript</li>
                      <li>• No impact on your GPA</li>
                      <li>• Clean withdrawal from course</li>
                      <li>• Can re-register in future terms</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">❌ After Section 1 Exam</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    If a student withdraws <strong>after completing the Section 1 exam</strong>, RTD Math Academy 
                    will submit a final grade to PASI.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-red-800">This grade will include:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• All completed assessments</li>
                      <li>• Zeros for any incomplete or missing coursework</li>
                      <li>• A final grade that may reflect a low or failing mark</li>
                      <li>• Permanent record on your transcript</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">🏛️ What is PASI?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>PASI (Provincial Approach to Student Information)</strong> is Alberta's official 
                    student record system. All grades, withdrawals, and academic records are reported to PASI.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium mb-2">PASI tracks:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Course enrollments and withdrawals</li>
                      <li>• Final grades and credits earned</li>
                      <li>• Diploma exam scores</li>
                      <li>• Academic transcripts</li>
                      <li>• Graduation requirements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-700 mb-2">📢 Additional PASI Reporting Situations</h4>
                  <p className="text-sm text-gray-700 mb-2">A final grade will also be submitted if a student:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Becomes inactive and doesn't meet with RTD administration after being locked out</li>
                    <li>• Reaches the end of term with an incomplete course</li>
                    <li>• Fails to respond to communication for extended periods</li>
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
                    <li>• Pay for exam fees and rewrites</li>
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

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📝 Step-by-Step MyPass Registration</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold mb-2">Create Your MyPass Account</h4>
                  <p className="text-sm text-gray-700 mb-2">Visit the MyPass website and create your account using your Alberta Student Number (ASN) and personal information.</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">💡 Tip: Have your ASN, birthdate, and photo ID ready</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold mb-2">Select Your Diploma Exams</h4>
                  <p className="text-sm text-gray-700 mb-2">Choose the diploma exams for your enrolled courses during the registration periods (typically fall and spring).</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">📅 Registration opens several months before exam sessions</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold mb-2">Choose Exam Location & Session</h4>
                  <p className="text-sm text-gray-700 mb-2">Select your preferred exam location and session time. Popular locations fill up quickly!</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">⏰ Register early for best location and time options</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold mb-2">Pay Registration Fees</h4>
                  <p className="text-sm text-gray-700 mb-2">Complete payment through MyPass. Fees vary by exam and any additional services.</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">💳 Payment required to confirm registration</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                <div>
                  <h4 className="font-semibold mb-2">Confirm Registration Details</h4>
                  <p className="text-sm text-gray-700 mb-2">Review all details and print your confirmation. Bring this to your exam!</p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">📄 Keep confirmation safe - you'll need it on exam day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-red-800">🚨 Critical Withdrawal Responsibility</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-red-700 mb-2">If You Withdraw from a Diploma Course:</h4>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>It is YOUR responsibility to cancel your diploma exam registration in MyPass.</strong> 
                  RTD Academy cannot do this for you.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Important steps:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Log into MyPass immediately</li>
                    <li>• Cancel your exam registration</li>
                    <li>• Check refund policies and deadlines</li>
                    <li>• Keep confirmation of cancellation</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Consequences of Not Cancelling:</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• You may forfeit exam fees</li>
                  <li>• You'll be marked as "No Show" if you don't attend</li>
                  <li>• This appears on your official record</li>
                  <li>• May affect future exam registrations</li>
                </ul>
                
                <div className="bg-yellow-100 rounded p-3 mt-3">
                  <p className="text-xs text-yellow-800">
                    💡 If you need to reschedule or cancel after payment, contact MyPass directly for assistance with refunds or transfers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">💰 Payment & Rewrite Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Exam Payments:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• All payments made directly to Alberta Education through MyPass</li>
                  <li>• RTD Academy does not handle diploma exam fees</li>
                  <li>• Payment required to secure your exam spot</li>
                  <li>• Credit card or bank transfer options available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Exam Rewrites:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Rewrite fees paid directly through MyPass</li>
                  <li>• Different fee structure than initial exams</li>
                  <li>• Multiple sessions available throughout the year</li>
                  <li>• Same registration process as initial exams</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Staying Active Section */}
      {activeSection === 'activity' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚡ Staying Active: Avoiding Inactivity Consequences</h2>
            <p className="text-gray-600 mb-6">
              Learn what happens when students become inactive and how to stay engaged with your coursework.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Activity Requirements</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">📋 What You Must Do</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="font-medium text-sm mb-1">🗓️ Log in Weekly</p>
                    <p className="text-xs text-gray-600">Access your course at least once per week</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium text-sm mb-1">📍 Stay on Schedule</p>
                    <p className="text-xs text-gray-600">Remain within 2 lessons of your target date</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium text-sm mb-1">✍️ Complete Check-ins</p>
                    <p className="text-xs text-gray-600">Monday check-in and Friday reflection</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="font-medium text-sm mb-1">📧 Respond to Communication</p>
                    <p className="text-xs text-gray-600">Check and respond to emails promptly</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">💡 Why These Matter</h4>
                <p className="text-sm text-gray-700 mb-3">
                  These requirements aren't arbitrary - they're designed to help you succeed in online learning 
                  and ensure you stay connected with your educational goals.
                </p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Weekly logins</strong> keep course material fresh in your mind</p>
                  <p><strong>Staying on schedule</strong> prevents overwhelming catch-up work</p>
                  <p><strong>Check-ins</strong> help you reflect on progress and plan ahead</p>
                  <p><strong>Communication</strong> ensures you get support when needed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">⚠️ Inactivity Consequences: Real Student Examples</h3>
            
            <div className="space-y-4">
              <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">📈 Escalating Response Process</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded p-3 text-center">
                    <h5 className="font-semibold text-yellow-800 mb-2">Week 1</h5>
                    <p className="text-sm text-gray-700">Email reminder sent</p>
                  </div>
                  <div className="bg-orange-50 rounded p-3 text-center">
                    <h5 className="font-semibold text-orange-800 mb-2">Week 2+</h5>
                    <p className="text-sm text-gray-700">Course access locked</p>
                  </div>
                  <div className="bg-red-50 rounded p-3 text-center">
                    <h5 className="font-semibold text-red-800 mb-2">No Response</h5>
                    <p className="text-sm text-gray-700">Student withdrawn</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">📚 Example: Sarah's Physics 30 Course</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Situation:</strong> Sarah stopped logging in during a busy work period</p>
                    <p><strong>Timeline:</strong></p>
                    <ul className="ml-4 space-y-1 text-xs">
                      <li>• Day 7: Email reminder sent</li>
                      <li>• Day 10: Second email with concern</li>
                      <li>• Day 14: Course access locked</li>
                      <li>• Day 21: Final withdrawal notice</li>
                    </ul>
                    <p><strong>Outcome:</strong> Sarah didn't respond and was withdrawn with her current grade (45%) submitted to PASI</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✅ Example: Mike's Math 30-1 Course</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Situation:</strong> Mike became inactive due to family emergency</p>
                    <p><strong>Response:</strong></p>
                    <ul className="ml-4 space-y-1 text-xs">
                      <li>• Responded to RTD's email explaining situation</li>
                      <li>• Scheduled meeting with administration</li>
                      <li>• Created modified timeline for completion</li>
                      <li>• Received temporary extension</li>
                    </ul>
                    <p><strong>Outcome:</strong> Mike successfully completed the course with support</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">🔄 The Meeting Requirement</h4>
                <p className="text-sm text-gray-700 mb-3">
                  If your course access is locked due to inactivity, you have <strong>one week</strong> to meet 
                  with the RTD Administration team to create a plan for resuming progress.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-sm mb-2">In the meeting, you'll discuss:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Reasons for inactivity</li>
                      <li>• Current life circumstances</li>
                      <li>• Realistic timeline for completion</li>
                      <li>• Support needed to succeed</li>
                      <li>• Modified schedule if necessary</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">If you don't meet:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• You will be withdrawn from the course</li>
                      <li>• Your current grade will be submitted to PASI</li>
                      <li>• This becomes part of your permanent record</li>
                      <li>• You cannot access course materials</li>
                      <li>• Must re-register to take the course again</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">🎯 Staying Active: Success Strategies</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📅 Time Management:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Set regular study times in your calendar</li>
                  <li>• Use reminders on your phone</li>
                  <li>• Plan for busy periods in advance</li>
                  <li>• Break large tasks into smaller chunks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤝 Communication:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Contact instructors BEFORE you fall behind</li>
                  <li>• Explain challenges early</li>
                  <li>• Ask for help with time management</li>
                  <li>• Use office hours for support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Weekly Planner Section */}
      {activeSection === 'planner' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📅 Interactive Weekly Study Planner</h2>
            <p className="text-gray-600 mb-6">
              Create your personalized weekly study schedule by dragging activities to different days. 
              Think about when you'll work on your course and where you might study.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">📝 How to Use the Planner</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>1. Drag study activities from the list below</li>
                  <li>2. Drop them onto your preferred days</li>
                  <li>3. Add multiple activities to each day as needed</li>
                  <li>4. Click the ✖ to remove items if you change your mind</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Planning Tips:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Consider your work/school schedule</li>
                  <li>• Plan for consistent daily engagement</li>
                  <li>• Include check-ins on Mondays and Fridays</li>
                  <li>• Balance different types of activities</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Activities to Drag */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700">📚 Study Activities</h3>
                <p className="text-sm text-gray-600 mb-4">Drag these activities to your weekly schedule →</p>
                
                <div className="space-y-3">
                  {plannerItems.activities.map((activity) => (
                    <div
                      key={activity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, activity)}
                      className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-all hover:shadow-md ${activity.color}`}
                    >
                      <div className="flex items-center">
                        <span className="text-sm mr-2">📋</span>
                        <span className="font-medium text-sm">{activity.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    💡 You can drag the same activity to multiple days if you want to spread it throughout the week!
                  </p>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">🗓️ Your Weekly Schedule</h3>
                
                <div className="space-y-3">
                  {Object.keys(plannerItems.schedule).map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        {day}
                      </h4>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day)}
                        className={`min-h-[60px] border-2 border-dashed rounded-lg p-3 transition-all ${
                          plannerItems.schedule[day].length > 0
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 bg-gray-50 hover:border-green-400'
                        }`}
                      >
                        {plannerItems.schedule[day].length > 0 ? (
                          <div className="space-y-2">
                            {plannerItems.schedule[day].map((item, index) => (
                              <div
                                key={item.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 mb-1 ${item.color}`}
                              >
                                <span className="mr-2">📋</span>
                                <span>{item.text}</span>
                                <button
                                  onClick={() => removeFromSchedule(day, item.id)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  ✖
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm italic text-center">
                            Drop study activities here...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Summary */}
          {Object.values(plannerItems.schedule).some(day => day.length > 0) && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">📊 Your Weekly Study Plan Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Active Study Days:</h4>
                  <p className="text-gray-700">
                    {Object.keys(plannerItems.schedule).filter(day => plannerItems.schedule[day].length > 0).join(', ') || 'None planned yet'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Total Planned Activities:</h4>
                  <p className="text-gray-700">
                    {Object.values(plannerItems.schedule).reduce((total, day) => total + day.length, 0)} activities scheduled
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded">
                <p className="text-sm text-green-700">
                  💡 <strong>Great planning!</strong> Remember to be realistic about your time commitments. 
                  It's better to plan less and be consistent than to over-plan and feel overwhelmed.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Learning Plans & Policies</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding with realistic scenarios and fill-in-the-blank questions about course policies and procedures.
            </p>
          </div>

          {/* Fill in the Blanks */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📝 Fill in the Blanks</h3>
            <p className="text-sm text-gray-600 mb-4">Complete each sentence with the correct term or phrase:</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>1.</strong> Students are expected to complete their course within 
                  <input 
                    type="text" 
                    className="mx-2 px-2 py-1 border border-blue-300 rounded w-24"
                    placeholder="____"
                    value={fillInBlanks.q1 || ''}
                    onChange={(e) => handleFillInBlank('q1', e.target.value)}
                  /> 
                  of enrollment.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>2.</strong> Students who withdraw before completing the 
                  <input 
                    type="text" 
                    className="mx-2 px-2 py-1 border border-green-300 rounded w-32"
                    placeholder="____"
                    value={fillInBlanks.q2 || ''}
                    onChange={(e) => handleFillInBlank('q2', e.target.value)}
                  /> 
                  exam will have their enrollment recorded as a Withdrawal (WDRW) in PASI.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>3.</strong> All students in diploma courses are required to register for their exams through 
                  <input 
                    type="text" 
                    className="mx-2 px-2 py-1 border border-purple-300 rounded w-24"
                    placeholder="____"
                    value={fillInBlanks.q3 || ''}
                    onChange={(e) => handleFillInBlank('q3', e.target.value)}
                  />.
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>4.</strong> If a student is inactive for more than one week, their course access may be temporarily 
                  <input 
                    type="text" 
                    className="mx-2 px-2 py-1 border border-orange-300 rounded w-24"
                    placeholder="____"
                    value={fillInBlanks.q4 || ''}
                    onChange={(e) => handleFillInBlank('q4', e.target.value)}
                  />.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm mb-2">
                  <strong>5.</strong> Students who don't meet with RTD Administration after being locked out will be 
                  <input 
                    type="text" 
                    className="mx-2 px-2 py-1 border border-red-300 rounded w-32"
                    placeholder="____"
                    value={fillInBlanks.q5 || ''}
                    onChange={(e) => handleFillInBlank('q5', e.target.value)}
                  /> 
                  from their course.
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const result = checkFillInBlanks();
                  alert(`You got ${result.score} out of ${result.total} correct!`);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Check My Answers
              </button>
            </div>
          </div>

          {/* Multiple Choice Scenarios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🎭 Scenario-Based Questions</h3>
            <p className="text-sm text-gray-600 mb-4">Choose the best response for each realistic student situation:</p>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Scenario 1: Alex's Missed Section 1 Exam</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Alex has been struggling with the course content and missed the Section 1 exam deadline. 
                  He's considering withdrawing from the course. What should Alex know?
                </p>
                <div className="space-y-2">
                  {[
                    'Since he missed Section 1, he\'ll automatically get a withdrawal (WDRW) on his transcript',
                    'He can still withdraw cleanly since he hasn\'t completed Section 1 exam',
                    'He must complete Section 1 before he can withdraw',
                    'His current grade will be submitted regardless of when he withdraws'
                  ].map((option, index) => (
                    <label key={index} className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario1"
                        className="mt-1 text-green-600"
                        onChange={() => handleMultipleChoice('scenario1', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Scenario 2: Maria's MyPass Registration</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Maria is enrolled in Math 30-1 and needs to register for the diploma exam. She's never used MyPass before. 
                  What's the most important thing for her to know?
                </p>
                <div className="space-y-2">
                  {[
                    'RTD Academy will register her automatically',
                    'She must create a MyPass account and register herself',
                    'She only needs to register if she wants to choose her exam location',
                    'MyPass registration is optional for Math 30-1'
                  ].map((option, index) => (
                    <label key={index} className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario2"
                        className="mt-1 text-green-600"
                        onChange={() => handleMultipleChoice('scenario2', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Scenario 3: Jordan's Inactivity Situation</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Jordan hasn't logged into his Physics 30 course for 10 days due to a family emergency. 
                  He just received an email saying his access has been locked. What should he do?
                </p>
                <div className="space-y-2">
                  {[
                    'Wait until the family emergency is over to respond',
                    'Immediately contact RTD to schedule a meeting within one week',
                    'Just start logging in again - the lock will automatically lift',
                    'Withdraw from the course to avoid getting a failing grade'
                  ].map((option, index) => (
                    <label key={index} className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario3"
                        className="mt-1 text-green-600"
                        onChange={() => handleMultipleChoice('scenario3', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Assessment */}
          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="02_learning_plans_completion_policies_practice"
            cloudFunctionName="course4_02_learning_plans_completion_policies_aiQuestion"
            title="Advanced Policy Scenarios"
            theme="indigo"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! You're Ready to Plan Your Success</h2>
        <div className="grid md:grid-cols-2 gap-6">
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
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 You now have all the tools and knowledge needed to succeed at RTD Academy. Remember: 
            consistency beats intensity, and we're here to support you every step of the way!
          </p>
        </div>
      </section>
    </div>
  );
};

export default LearningPlansCourseCompletionDiplomaExamPolicies;