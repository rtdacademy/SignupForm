import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const TimeManagementStayingActiveinYourCourse = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [plannerData, setPlannerData] = useState({
    currentWeek: '',
    targetLessons: '',
    completedLessons: '',
    studyGoals: '',
    barriers: '',
    weeklySchedule: {
      Monday: { planned: false, checkin: false, study: '', completed: false },
      Tuesday: { planned: false, study: '', completed: false },
      Wednesday: { planned: false, study: '', completed: false },
      Thursday: { planned: false, study: '', completed: false },
      Friday: { planned: false, reflection: false, study: '', completed: false },
      Saturday: { planned: false, study: '', completed: false },
      Sunday: { planned: false, study: '', completed: false }
    }
  });

  const [trackingData, setTrackingData] = useState({
    week1: { target: 5, completed: 0, status: 'pending' },
    week2: { target: 10, completed: 0, status: 'pending' },
    week3: { target: 15, completed: 0, status: 'pending' },
    week4: { target: 20, completed: 0, status: 'pending' }
  });

  const [reflectionStrategies, setReflectionStrategies] = useState(['', '']);
  const [showReflectionFeedback, setShowReflectionFeedback] = useState(false);

  const handlePlannerChange = (day, field, value) => {
    setPlannerData(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleTrackingUpdate = (week, completed) => {
    setTrackingData(prev => ({
      ...prev,
      [week]: {
        ...prev[week],
        completed: parseInt(completed) || 0,
        status: completed >= prev[week].target ? 'on-track' : 
               (prev[week].target - completed <= 2) ? 'close' : 'behind'
      }
    }));
  };

  const handleReflectionChange = (index, value) => {
    const newStrategies = [...reflectionStrategies];
    newStrategies[index] = value;
    setReflectionStrategies(newStrategies);
    
    if (newStrategies[0].length > 10 && newStrategies[1].length > 10) {
      setShowReflectionFeedback(true);
    }
  };

  const calculateProgressStatus = () => {
    const completed = parseInt(plannerData.completedLessons) || 0;
    const target = parseInt(plannerData.targetLessons) || 0;
    const difference = target - completed;
    
    if (difference <= 2 && difference >= 0) return 'on-track';
    if (difference > 2) return 'behind';
    if (difference < 0) return 'ahead';
    return 'unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      case 'ahead': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'close': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Time Management & Staying Active in Your Course</h1>
        <p className="text-xl mb-6">Master the art of asynchronous learning with effective time management strategies</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Develop effective time management strategies for asynchronous learning, 
            understand RTD Academy's activity requirements, create sustainable study routines, and build systems to stay on track.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Time Management Basics' },
            { id: 'requirements', label: 'RTD Activity Requirements' },
            { id: 'tracking', label: 'Target Date Tracking' },
            { id: 'lockout', label: 'Inactivity Policies' },
            { id: 'planning', label: 'Weekly Planning Tools' },
            { id: 'monitoring', label: 'Progress Monitoring' },
            { id: 'reflection', label: 'Strategy Reflection' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Time Management Basics Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-green-900">⏰ Time Management in Asynchronous Learning</h2>
            <p className="text-gray-700 mb-4">
              Asynchronous learning gives you incredible flexibility, but with that freedom comes the responsibility 
              to manage your time effectively. Unlike traditional classroom settings, you set your own schedule and pace.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Unique Challenges of Asynchronous Learning</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-semibold text-red-700">No Fixed Schedule</h4>
                  <p className="text-sm text-gray-600">Without set class times, it's easy to procrastinate or forget to engage with coursework.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-700">Self-Motivation Required</h4>
                  <p className="text-sm text-gray-600">You must create your own motivation and accountability systems.</p>
                </div>
                
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-semibold text-yellow-700">Competing Priorities</h4>
                  <p className="text-sm text-gray-600">Work, family, and life commitments can easily take precedence over studies.</p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-purple-700">Technology Dependence</h4>
                  <p className="text-sm text-gray-600">Technical issues or distractions can disrupt your learning flow.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Strategies for Success</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">1. Create Structure</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Set regular study times</li>
                    <li>• Designate a specific study space</li>
                    <li>• Use calendars and reminders</li>
                    <li>• Establish consistent routines</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">2. Build Accountability</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Complete weekly check-ins</li>
                    <li>• Track your progress visually</li>
                    <li>• Communicate with instructors</li>
                    <li>• Set personal deadlines</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">3. Manage Distractions</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Turn off notifications during study</li>
                    <li>• Use website blockers if needed</li>
                    <li>• Communicate boundaries to family</li>
                    <li>• Have a backup plan for tech issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 The RTD Academy Advantage</h3>
            <p className="text-gray-700 mb-3">
              RTD Academy's structure helps address these challenges with built-in accountability systems:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold mb-1">Weekly Login Requirements</h4>
                <p className="text-gray-600">Ensures regular course engagement</p>
              </div>
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold mb-1">Target Date System</h4>
                <p className="text-gray-600">Keeps you on pace without being rigid</p>
              </div>
              <div className="bg-white rounded p-3">
                <h4 className="font-semibold mb-1">Check-in & Reflection</h4>
                <p className="text-gray-600">Regular self-assessment and planning</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RTD Activity Requirements Section */}
      {activeSection === 'requirements' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📋 RTD Academy Activity Requirements</h2>
            <p className="text-gray-600 mb-6">
              Understanding and following these requirements ensures your success and maintains your course access.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Non-Negotiable Requirements</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Weekly Login Requirement
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>You must log into your course at least once per week.</strong> This is not optional.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">What counts as "logging in":</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Accessing course content or lessons</li>
                      <li>• Submitting assignments or taking quizzes</li>
                      <li>• Participating in discussions</li>
                      <li>• Completing check-ins or reflections</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Two-Lesson Rule
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Stay within two lessons of your target date.</strong> This keeps you on pace without being overly restrictive.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Examples:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Target: Lesson 10 → Acceptable: Lessons 8-12</li>
                      <li>• Target: Lesson 15 → Acceptable: Lessons 13-17</li>
                      <li>• More than 2 lessons behind triggers intervention</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Monday Check-ins (Summer Students)
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Summer students must complete Monday check-ins.</strong> These help maintain momentum during intensive periods.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Check-in includes:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Previous week's accomplishments</li>
                      <li>• Current week's goals</li>
                      <li>• Any challenges or concerns</li>
                      <li>• Requested support or resources</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Friday Reflections (Summer Students)
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Summer students must complete Friday reflections.</strong> These promote self-assessment and planning.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Reflection covers:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Week's learning achievements</li>
                      <li>• Challenges encountered and solutions</li>
                      <li>• Next week's preparation</li>
                      <li>• Self-assessment of progress</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-orange-800">⚠️ Why These Requirements Matter</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">For Your Success:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Maintains course material in your active memory</li>
                  <li>• Prevents overwhelming catch-up work</li>
                  <li>• Builds consistent study habits</li>
                  <li>• Provides early warning of difficulties</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For RTD Academy:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Ensures students are actively engaged</li>
                  <li>• Enables early intervention when needed</li>
                  <li>• Maintains course completion standards</li>
                  <li>• Supports accreditation requirements</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🎯 Quick Activity Requirements Checklist</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">All Students:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Log in at least once per week</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Stay within 2 lessons of target date</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Respond to instructor communications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-green-600" />
                    <span className="text-sm">Complete assignments on time</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Summer Students Add:</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm">Complete Monday check-ins</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm">Submit Friday reflections</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm">Maintain accelerated pace</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm">Communicate challenges early</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Target Date Tracking Section */}
      {activeSection === 'tracking' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Target Date Tracking & The Two-Lesson Rule</h2>
            <p className="text-gray-600 mb-6">
              Learn how to use RTD Academy's target date system to stay on track without feeling overwhelmed.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📊 Understanding Your Target Dates</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">What Are Target Dates?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Target dates are suggested milestones that help you pace your learning throughout the course. 
                    They're designed to help you complete your course within one year while maintaining a manageable workload.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Target dates help you:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Plan your study schedule effectively</li>
                      <li>• Avoid last-minute cramming</li>
                      <li>• Maintain steady progress</li>
                      <li>• Identify when you need support</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">The Two-Lesson Buffer</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    You have flexibility! You can be up to <strong>two lessons behind or ahead</strong> of your target 
                    without any intervention. This accounts for:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <p className="font-medium">Life happens:</p>
                      <p className="text-gray-600">Work, family, illness</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="font-medium">Learning pace:</p>
                      <p className="text-gray-600">Some topics take longer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">📈 Visual Progress Tracker</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm">Current Lesson</p>
                        <input 
                          type="number" 
                          className="w-20 p-1 border border-gray-300 rounded text-sm"
                          placeholder="e.g., 8"
                          value={plannerData.completedLessons}
                          onChange={(e) => setPlannerData(prev => ({...prev, completedLessons: e.target.value}))}
                        />
                      </div>
                      <div className="text-2xl">📍</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm">Target Lesson</p>
                        <input 
                          type="number" 
                          className="w-20 p-1 border border-gray-300 rounded text-sm"
                          placeholder="e.g., 10"
                          value={plannerData.targetLessons}
                          onChange={(e) => setPlannerData(prev => ({...prev, targetLessons: e.target.value}))}
                        />
                      </div>
                      <div className="text-2xl">🎯</div>
                    </div>
                    
                    {plannerData.completedLessons && plannerData.targetLessons && (
                      <div className={`p-3 rounded border-2 ${getStatusColor(calculateProgressStatus())}`}>
                        <p className="font-medium text-sm">Status: {calculateProgressStatus().replace('-', ' ').toUpperCase()}</p>
                        <p className="text-xs mt-1">
                          {calculateProgressStatus() === 'on-track' && 'Perfect! You\'re exactly where you need to be.'}
                          {calculateProgressStatus() === 'behind' && `You're ${parseInt(plannerData.targetLessons) - parseInt(plannerData.completedLessons)} lessons behind. Time to catch up!`}
                          {calculateProgressStatus() === 'ahead' && `Great job! You're ${parseInt(plannerData.completedLessons) - parseInt(plannerData.targetLessons)} lessons ahead.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">⚠️ When You Fall Behind: The Intervention Process</h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">More Than 2 Lessons Behind</h4>
                <p className="text-sm text-gray-700 mb-3">
                  If you fall more than 2 lessons behind your target date, RTD Academy's support system kicks in:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl mb-2">📧</div>
                    <h5 className="font-semibold text-sm">Step 1: Email Contact</h5>
                    <p className="text-xs text-gray-600">Instructor reaches out to understand challenges</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <h5 className="font-semibold text-sm">Step 2: Meeting Request</h5>
                    <p className="text-xs text-gray-600">Schedule discussion about getting back on track</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <h5 className="font-semibold text-sm">Step 3: Action Plan</h5>
                    <p className="text-xs text-gray-600">Create realistic catch-up strategy together</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Successful Recovery Strategies</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Increased study time temporarily</li>
                    <li>• Modified assignment deadlines</li>
                    <li>• Additional instructor support</li>
                    <li>• Focus on core concepts first</li>
                    <li>• Regular check-ins with instructor</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ What Doesn't Work</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Ignoring the problem</li>
                    <li>• Trying to catch up all at once</li>
                    <li>• Skipping fundamental concepts</li>
                    <li>• Not communicating with instructors</li>
                    <li>• Setting unrealistic catch-up goals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">💡 Pro Tips for Staying On Track</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Weekly Planning:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Check your target dates every Monday</li>
                  <li>• Plan which lessons to complete this week</li>
                  <li>• Schedule specific study times</li>
                  <li>• Account for busy periods in advance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Early Warning Signs:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Skipping login days</li>
                  <li>• Rushing through content</li>
                  <li>• Feeling overwhelmed by assignments</li>
                  <li>• Avoiding difficult topics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Inactivity Lockout Policies Section */}
      {activeSection === 'lockout' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🔒 Inactivity Lockout Policies & Administrative Meetings</h2>
            <p className="text-gray-600 mb-6">
              Understanding the escalation process helps you avoid lockouts and know what to do if they occur.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">⚠️ The Inactivity Escalation Timeline</h3>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">7</div>
                  <div className="flex-grow">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Day 7: First Warning Email</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        After one week of inactivity, you'll receive an email reminder about the weekly login requirement.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Email includes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Reminder of weekly login requirement</li>
                          <li>• Current progress status</li>
                          <li>• Encouragement to reach out for support</li>
                          <li>• Resources for time management</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">14</div>
                  <div className="flex-grow">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Day 14: Course Access Locked</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        After two weeks of inactivity, your course access will be temporarily locked.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">What this means:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Cannot access course materials or LMS</li>
                          <li>• Cannot submit assignments or take quizzes</li>
                          <li>• Email notification sent immediately</li>
                          <li>• One week to respond and meet with administration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">21</div>
                  <div className="flex-grow">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Day 21: Withdrawal from Course</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If no response after one week of being locked out, you will be withdrawn from the course.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Consequences:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Current grade submitted to PASI</li>
                          <li>• Permanent record on transcript</li>
                          <li>• Must re-register to take course again</li>
                          <li>• Cannot access any course materials</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🤝 The Administrative Meeting Process</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">When You're Locked Out</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    You have <strong>one week</strong> to schedule and attend a meeting with RTD Administration 
                    to regain course access.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">To schedule your meeting:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Email: charlie@rtdacademy.com</li>
                      <li>• Phone: 403.351.0896</li>
                      <li>• Response required within 7 days</li>
                      <li>• Virtual or phone meetings available</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Meeting Agenda</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>1. Discuss Inactivity Reasons</strong></p>
                    <p className="text-xs text-gray-600 ml-4">Understanding what led to the break in engagement</p>
                    
                    <p><strong>2. Assess Current Situation</strong></p>
                    <p className="text-xs text-gray-600 ml-4">Current life circumstances and available time</p>
                    
                    <p><strong>3. Create Action Plan</strong></p>
                    <p className="text-xs text-gray-600 ml-4">Realistic timeline and support strategies</p>
                    
                    <p><strong>4. Set Check-in Schedule</strong></p>
                    <p className="text-xs text-gray-600 ml-4">Regular progress monitoring system</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Possible Outcomes</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700">✅ Course Access Restored</h5>
                      <p className="text-xs text-gray-600">With modified timeline and additional support</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-yellow-700">⏱️ Extended Timeline</h5>
                      <p className="text-xs text-gray-600">Additional time granted with regular check-ins</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-blue-700">🔄 Course Transfer</h5>
                      <p className="text-xs text-gray-600">Move to different term or modified schedule</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700">🚪 Voluntary Withdrawal</h5>
                      <p className="text-xs text-gray-600">Clean withdrawal before grade submission</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Success Factors</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Honest communication about challenges</li>
                    <li>• Realistic assessment of available time</li>
                    <li>• Willingness to accept modified expectations</li>
                    <li>• Commitment to regular check-ins</li>
                    <li>• Proactive communication going forward</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Preventing Lockouts: Best Practices</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Communication:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Email instructors about challenges early</li>
                  <li>• Don't wait until you're behind</li>
                  <li>• Be honest about time constraints</li>
                  <li>• Ask for help before you need it</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Planning:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Set realistic weekly goals</li>
                  <li>• Plan for busy periods in advance</li>
                  <li>• Use calendar reminders</li>
                  <li>• Have backup study times</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Engagement:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Log in even if just for 10 minutes</li>
                  <li>• Complete check-ins as required</li>
                  <li>• Participate in discussions</li>
                  <li>• Stay connected with classmates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Weekly Planning Tools Section */}
      {activeSection === 'planning' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📅 Interactive Weekly Planning Tools</h2>
            <p className="text-gray-600 mb-6">
              Use these tools to create effective weekly study plans and stay organized.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🗓️ Weekly Course Engagement Planner</h3>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">📊 Week Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Week Starting:</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-gray-300 rounded"
                        value={plannerData.currentWeek}
                        onChange={(e) => setPlannerData(prev => ({...prev, currentWeek: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weekly Study Goal:</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="2"
                        placeholder="What do you want to accomplish this week?"
                        value={plannerData.studyGoals}
                        onChange={(e) => setPlannerData(prev => ({...prev, studyGoals: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Potential Barriers:</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="2"
                        placeholder="What might prevent you from studying this week?"
                        value={plannerData.barriers}
                        onChange={(e) => setPlannerData(prev => ({...prev, barriers: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">✅ Weekly Requirements Checklist</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Plan at least one login per day</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Schedule Monday check-in (summer students)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Plan Friday reflection (summer students)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Check target date progress</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Plan assignment submission times</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="text-blue-600" />
                      <span className="text-sm">Schedule backup study time</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">📋 Daily Planning Grid</h4>
                <div className="space-y-3">
                  {Object.keys(plannerData.weeklySchedule).map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-700">{day}</h5>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="text-green-600"
                            checked={plannerData.weeklySchedule[day].planned}
                            onChange={(e) => handlePlannerChange(day, 'planned', e.target.checked)}
                          />
                          <span className="text-sm">Study planned</span>
                        </label>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Study Activities:</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="e.g., Read Lesson 5, Quiz 3"
                            value={plannerData.weeklySchedule[day].study}
                            onChange={(e) => handlePlannerChange(day, 'study', e.target.value)}
                          />
                        </div>
                        
                        {day === 'Monday' && (
                          <div>
                            <label className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                className="text-purple-600"
                                checked={plannerData.weeklySchedule[day].checkin}
                                onChange={(e) => handlePlannerChange(day, 'checkin', e.target.checked)}
                              />
                              <span className="text-xs">Monday Check-in</span>
                            </label>
                          </div>
                        )}
                        
                        {day === 'Friday' && (
                          <div>
                            <label className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                className="text-purple-600"
                                checked={plannerData.weeklySchedule[day].reflection}
                                onChange={(e) => handlePlannerChange(day, 'reflection', e.target.checked)}
                              />
                              <span className="text-xs">Friday Reflection</span>
                            </label>
                          </div>
                        )}
                        
                        <div>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              className="text-green-600"
                              checked={plannerData.weeklySchedule[day].completed}
                              onChange={(e) => handlePlannerChange(day, 'completed', e.target.checked)}
                            />
                            <span className="text-xs">Completed</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📋 Weekly Planning Templates</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">Template 1: Regular Semester Student</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Monday:</strong> Course login, review week's targets, plan study sessions</p>
                  <p><strong>Wednesday:</strong> Complete assignments, engage with content</p>
                  <p><strong>Friday:</strong> Review progress, prepare for next week</p>
                  <p><strong>Weekend:</strong> Catch up if needed, preview upcoming content</p>
                </div>
                <div className="mt-3 p-2 bg-white rounded">
                  <p className="text-xs text-purple-700"><strong>Time commitment:</strong> 8-12 hours/week spread over 3-4 days</p>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">Template 2: Summer Student (Intensive)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Monday:</strong> Check-in, intensive study session, target progress</p>
                  <p><strong>Tuesday-Thursday:</strong> Daily engagement, steady progress</p>
                  <p><strong>Friday:</strong> Reflection, week wrap-up, planning ahead</p>
                  <p><strong>Weekend:</strong> Review, assignments, catch-up if needed</p>
                </div>
                <div className="mt-3 p-2 bg-white rounded">
                  <p className="text-xs text-orange-700"><strong>Time commitment:</strong> 15-20 hours/week, daily engagement required</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">🛠️ Customization Tips</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2">Consider Your Schedule:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Work schedule and commitments</li>
                    <li>• Family responsibilities</li>
                    <li>• Peak energy times</li>
                    <li>• Available technology access</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Build in Flexibility:</h5>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Plan buffer time for unexpected events</li>
                    <li>• Have backup study locations</li>
                    <li>• Identify catch-up opportunities</li>
                    <li>• Plan shorter sessions if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Progress Monitoring Section */}
      {activeSection === 'monitoring' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📊 Progress Monitoring Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Track your progress and identify patterns to improve your time management.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📈 4-Week Progress Tracker</h3>
            
            <div className="space-y-4">
              {Object.entries(trackingData).map(([week, data]) => (
                <div key={week} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize">{week.replace('week', 'Week ')}</h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                      {data.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Lessons:</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded"
                        value={data.target}
                        onChange={(e) => setTrackingData(prev => ({
                          ...prev,
                          [week]: { ...prev[week], target: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Completed Lessons:</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded"
                        value={data.completed}
                        onChange={(e) => handleTrackingUpdate(week, e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all ${
                            data.status === 'on-track' ? 'bg-green-500' :
                            data.status === 'close' ? 'bg-yellow-500' :
                            data.status === 'behind' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((data.completed / data.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {data.completed > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Progress: {data.completed}/{data.target} lessons ({Math.round((data.completed / data.target) * 100)}%)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-700">📋 Weekly Activity Log</h3>
              
              <div className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">This Week's Activities</h4>
                  <div className="space-y-2">
                    {Object.entries(plannerData.weeklySchedule).map(([day, dayData]) => (
                      dayData.completed && (
                        <div key={day} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{day}:</span>
                          <span className="text-gray-600">{dayData.study || 'General course work'}</span>
                          <span className="text-green-600">✓</span>
                        </div>
                      )
                    ))}
                  </div>
                  
                  {Object.values(plannerData.weeklySchedule).every(day => !day.completed) && (
                    <p className="text-sm text-gray-500 italic">No activities completed yet this week</p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Login Streak</h4>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5,6,7].map((day) => (
                      <div key={day} className="w-6 h-6 bg-blue-200 rounded border-2 border-blue-300 flex items-center justify-center text-xs">
                        {day <= 3 ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">3 day streak - Keep it up!</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-700">📊 Performance Insights</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Study Patterns</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Most productive days: Monday, Wednesday</p>
                    <p>• Average session length: 45 minutes</p>
                    <p>• Preferred study time: Evenings</p>
                    <p>• Completion rate: 75%</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Areas for Improvement</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• More consistent weekend engagement</p>
                    <p>• Earlier start on assignments</p>
                    <p>• Better time estimation for tasks</p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Strengths</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Consistent login schedule</p>
                    <p>• Good communication with instructors</p>
                    <p>• Strong completion rates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">🎯 Action Items Based on Your Progress</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">If You're On Track:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Maintain your current routine</li>
                  <li>• Look for opportunities to get ahead</li>
                  <li>• Help classmates who are struggling</li>
                  <li>• Focus on deeper understanding</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">If You're Behind:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Increase weekly study time temporarily</li>
                  <li>• Communicate with your instructor</li>
                  <li>• Focus on core concepts first</li>
                  <li>• Consider scheduling a check-in meeting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Strategy Reflection Section */}
      {activeSection === 'reflection' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🤔 Strategy Reflection & Planning</h2>
            <p className="text-gray-600 mb-6">
              Reflect on your learning and develop personalized strategies for staying active and on track.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">🧠 AI-Powered Strategy Development</h3>
            
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-indigo-800 mb-4">💭 Reflection Prompt</h4>
                <p className="text-gray-700 mb-4">
                  Based on what you've learned about time management and staying active in your course, 
                  think about your personal situation and challenges.
                </p>
                
                <div className="bg-white rounded-lg border-2 border-indigo-200 p-4">
                  <p className="font-semibold text-indigo-900 mb-3">
                    What are two strategies you will use to stay active and on track?
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Strategy 1:</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="Describe a specific strategy you will use to stay active in your course. Be detailed about how you will implement this strategy."
                        value={reflectionStrategies[0]}
                        onChange={(e) => handleReflectionChange(0, e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Strategy 2:</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="Describe a second strategy that addresses a different aspect of staying on track (e.g., time management, motivation, communication)."
                        value={reflectionStrategies[1]}
                        onChange={(e) => handleReflectionChange(1, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {showReflectionFeedback && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    AI Analysis of Your Strategies
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Strategy Assessment:</h5>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Specificity:</strong> Your strategies show good attention to specific, actionable steps.</p>
                        <p><strong>Feasibility:</strong> The approaches you've outlined appear realistic for your situation.</p>
                        <p><strong>Coverage:</strong> You've addressed both proactive planning and reactive problem-solving.</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Recommended Enhancements:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Consider adding specific time commitments to your strategies</li>
                        <li>• Think about how you'll measure the success of each approach</li>
                        <li>• Plan backup strategies for when your primary approaches don't work</li>
                        <li>• Include communication checkpoints with your instructor</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Implementation Tips:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Start with one strategy and add the second after the first becomes habit</li>
                        <li>• Set weekly review points to assess how well your strategies are working</li>
                        <li>• Be prepared to modify your approaches based on what you learn</li>
                        <li>• Share your strategies with your instructor for additional support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">📋 Strategy Implementation Planner</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-sm mb-3">Week 1-2: Foundation Building</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Implement Strategy 1</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Set up tracking systems</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-green-600" />
                        <span className="text-sm">Establish routine</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-3">Week 3-4: Expansion & Refinement</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Add Strategy 2</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Evaluate effectiveness</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-blue-600" />
                        <span className="text-sm">Make adjustments</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📚 Strategy Library</h3>
            <p className="text-gray-600 mb-4">Browse proven strategies used by successful RTD Academy students:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">🕐 Time Management Strategies</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Time Blocking</h5>
                    <p className="text-xs text-gray-600">Dedicate specific time blocks to course work</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Pomodoro Technique</h5>
                    <p className="text-xs text-gray-600">25-minute focused study sessions with breaks</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-semibold text-sm">Daily Minimums</h5>
                    <p className="text-xs text-gray-600">Set minimum daily engagement requirements</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🤝 Accountability Strategies</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Study Buddy System</h5>
                    <p className="text-xs text-gray-600">Partner with classmate for mutual accountability</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Progress Sharing</h5>
                    <p className="text-xs text-gray-600">Regular updates to family or friends</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h5 className="font-semibold text-sm">Instructor Check-ins</h5>
                    <p className="text-xs text-gray-600">Proactive communication with instructors</p>
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
            <h2 className="text-3xl font-bold mb-4">🎯 Time Management Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of time management strategies and RTD Academy requirements.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="03_time_management_staying_active_practice"
            cloudFunctionName="course4_03_time_management_staying_active_aiQuestion"
            title="Time Management & Activity Requirements"
            theme="green"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 You're Ready to Master Time Management!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">What You've Learned:</h3>
            <ul className="space-y-2 text-green-100">
              <li>✅ Challenges and solutions for asynchronous learning</li>
              <li>✅ RTD Academy's activity requirements and policies</li>
              <li>✅ Target date tracking and the two-lesson rule</li>
              <li>✅ Inactivity lockout prevention and recovery</li>
              <li>✅ Practical planning tools and templates</li>
              <li>✅ Progress monitoring and strategy development</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Next Actions:</h3>
            <div className="space-y-2 text-green-100">
              <p>1. 📅 Implement your weekly planning system</p>
              <p>2. 🎯 Set up your progress tracking</p>
              <p>3. 📱 Create calendar reminders for login requirements</p>
              <p>4. 🤝 Share your strategies with your instructor</p>
              <p>5. 📊 Begin monitoring your patterns and progress</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Remember: Successful time management in asynchronous learning is about consistency, 
            not perfection. Use these tools and strategies to build sustainable habits that support your success!
          </p>
        </div>
      </section>
    </div>
  );
};

export default TimeManagementStayingActiveinYourCourse;