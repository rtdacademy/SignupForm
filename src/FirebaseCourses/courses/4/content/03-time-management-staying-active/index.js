import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
// useProgress removed - completion tracking is now handled automatically

const TimeManagementStayingActiveinYourCourse = ({ course, courseId, itemId, activeItem, onAIAccordionContent }) => {
  // markCompleted removed - completion tracking is now handled automatically
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
            { id: 'lockout', label: 'Inactivity Policies' },
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
                    Weekly Reflection (Summer Students)
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Summer students must complete weekly reflections.</strong> These help maintain momentum during intensive periods and promote self-assessment.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Weekly reflection includes:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Previous week's accomplishments</li>
                      <li>• Current week's goals and preparation</li>
                      <li>• Self-assessment of progress</li>
                      <li>• Any concerns or requested support</li>
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
                          <li>• Two weeks to respond and meet with administration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">28</div>
                  <div className="flex-grow">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Day 28: Withdrawal from Course</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If no response after two weeks of being locked out, you will be withdrawn from the course.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Consequences:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Current grade submitted to your MyPass transcript</li>
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
                  <li>• Complete homework questions at least once per week</li>
                  <li>• Complete weekly check-ins as required</li>
                  <li>• Stay on track with your personal schedule</li>
                  <li>• Submit assignments and assessments regularly</li>
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
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Time Management & Activity Requirements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of RTD Academy requirements and inactivity policies.
            </p>
          </div>

          <SlideshowKnowledgeCheck
            courseId={courseId}
            lessonPath="03-time-management-staying-active"
            course={course}
            // onAIAccordionContent={onAIAccordionContent}  // Commented out to hide "Ask AI" button
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question1',
                title: 'Question 1: Weekly Login Requirement'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question2',
                title: 'Question 2: Two-Lesson Rule'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question3',
                title: 'Question 3: Inactivity Timeline'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question4',
                title: 'Question 4: Response Time After Lockout'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question5',
                title: 'Question 5: Total Withdrawal Timeline'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question6',
                title: 'Question 6: Sarah\'s Lockout Situation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question7',
                title: 'Question 7: Marcus\'s Prevention Strategy'
              },
              {
                type: 'multiple-choice',
                questionId: 'course4_03_time_management_question8',
                title: 'Question 8: Lisa\'s Communication Plan'
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