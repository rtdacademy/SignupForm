import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const AcademicIntegrityViolationConsequences = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scenarioAnswers, setScenarioAnswers] = useState({});
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);
  
  // Drag and Drop State
  const [dragItems, setDragItems] = useState({
    available: [
      { id: 'citing-sources', text: 'Citing sources in your assignment', category: 'ethical' },
      { id: 'using-chatgpt-exam', text: 'Using ChatGPT to answer exam questions', category: 'unethical' },
      { id: 'asking-clarification', text: 'Asking instructor for clarification during exam', category: 'ethical' },
      { id: 'sharing-answers', text: 'Sharing quiz answers with classmates', category: 'unethical' },
      { id: 'study-group', text: 'Forming a study group to review material', category: 'ethical' },
      { id: 'copying-assignment', text: 'Copying another student\'s assignment', category: 'unethical' },
      { id: 'using-calculator', text: 'Using approved calculator during math exam', category: 'ethical' },
      { id: 'impersonation', text: 'Having someone else take your exam', category: 'unethical' },
      { id: 'referencing-notes', text: 'Referencing course notes during open-book test', category: 'ethical' },
      { id: 'accessing-internet', text: 'Searching Google during closed-book exam', category: 'unethical' }
    ],
    ethical: [],
    unethical: []
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [sortingComplete, setSortingComplete] = useState(false);
  
  // Integrity Pledge State
  const [pledgeData, setPledgeData] = useState({
    studentName: '',
    date: new Date().toLocaleDateString(),
    understanding: '',
    commitment: '',
    consequences: '',
    signature: '',
    completed: false
  });

  const handleScenarioAnswer = (scenarioId, answer) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenarioId]: answer
    }));
  };

  const checkScenarioAnswers = () => {
    const correctAnswers = {
      scenario1: 'violation',
      scenario2: 'violation', 
      scenario3: 'acceptable',
      scenario4: 'violation',
      scenario5: 'acceptable',
      scenario6: 'violation'
    };
    
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (scenarioAnswers[key] === correctAnswers[key]) {
        score++;
      }
    });
    
    setShowScenarioFeedback(true);
    return { score, total: Object.keys(correctAnswers).length };
  };

  // Drag and Drop Functions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    if (draggedItem) {
      setDragItems(prev => {
        const newItems = { ...prev };
        
        // Remove from current location
        Object.keys(newItems).forEach(category => {
          newItems[category] = newItems[category].filter(item => item.id !== draggedItem.id);
        });
        
        // Add to target category
        newItems[targetCategory] = [...newItems[targetCategory], draggedItem];
        
        return newItems;
      });
      setDraggedItem(null);
    }
  };

  const checkSorting = () => {
    let correct = 0;
    let total = 0;
    
    [...dragItems.ethical, ...dragItems.unethical].forEach(item => {
      total++;
      const inCorrectCategory = 
        (item.category === 'ethical' && dragItems.ethical.includes(item)) ||
        (item.category === 'unethical' && dragItems.unethical.includes(item));
      if (inCorrectCategory) correct++;
    });
    
    setSortingComplete(true);
    return { correct, total };
  };

  const handlePledgeChange = (field, value) => {
    setPledgeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const completePledge = () => {
    if (pledgeData.studentName && pledgeData.understanding && pledgeData.commitment && 
        pledgeData.consequences && pledgeData.signature) {
      setPledgeData(prev => ({ ...prev, completed: true }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Academic Integrity & Violation Consequences</h1>
        <p className="text-xl mb-6">Master the principles of academic honesty and understand the serious consequences of violations</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand RTD Academy's academic integrity policy, 
            identify examples of academic dishonesty, learn the disciplinary process, and commit to upholding ethical standards.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Policy Overview' },
            { id: 'violations', label: 'Types of Violations' },
            { id: 'examples', label: 'Real Examples' },
            { id: 'discipline', label: 'Disciplinary Process' },
            { id: 'appeals', label: 'Appeals Policy' },
            { id: 'scenarios', label: 'Practice Scenarios' },
            { id: 'sorting', label: 'Ethical vs Unethical' },
            { id: 'pledge', label: 'Integrity Pledge' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Policy Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-red-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-900">📜 RTD Academy Academic Integrity Policy</h2>
            <p className="text-gray-700 mb-4">
              Academic integrity is fundamental to your success and the integrity of RTD Academy. Our policy ensures 
              that all students are evaluated fairly and that academic achievements reflect genuine knowledge and skills.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Core Principles</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Honesty in All Work
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    All assignments, quizzes, and exams must be your own original work.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">This means:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Completing all assessments independently</li>
                      <li>• Not copying from other sources without citation</li>
                      <li>• Using only authorized resources during exams</li>
                      <li>• Representing your true understanding</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Respect for Learning Process
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Honor the educational process and the efforts of your peers and instructors.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Examples include:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Not sharing exam content with others</li>
                      <li>• Respecting intellectual property</li>
                      <li>• Maintaining confidentiality of assessments</li>
                      <li>• Supporting fair evaluation for everyone</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Accountability & Responsibility
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Take responsibility for understanding and following academic integrity standards.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Your responsibilities:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Know what constitutes academic dishonesty</li>
                      <li>• Ask questions when policies are unclear</li>
                      <li>• Report suspected violations</li>
                      <li>• Accept consequences if violations occur</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Ethical Use of Technology
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Use technology appropriately and within the guidelines of each assessment.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Technology guidelines:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• No unauthorized AI tool usage during exams</li>
                      <li>• Respect software and platform restrictions</li>
                      <li>• Use assistive technology only when approved</li>
                      <li>• Maintain security of login credentials</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚖️ Why Academic Integrity Matters</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">For You:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Develops genuine skills and knowledge</li>
                  <li>• Builds confidence in your abilities</li>
                  <li>• Prepares you for future challenges</li>
                  <li>• Maintains the value of your credentials</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Your Peers:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Ensures fair competition and evaluation</li>
                  <li>• Protects the integrity of grades</li>
                  <li>• Maintains trust in the system</li>
                  <li>• Supports collaborative learning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Society:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Maintains trust in educational credentials</li>
                  <li>• Ensures competent professionals</li>
                  <li>• Upholds ethical standards</li>
                  <li>• Protects academic reputation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Types of Violations Section */}
      {activeSection === 'violations' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🚫 Types of Academic Integrity Violations</h2>
            <p className="text-gray-600 mb-6">
              Understanding what constitutes academic dishonesty helps you avoid violations and maintain integrity.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">📝 Plagiarism</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">What is Plagiarism?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Using someone else's work, ideas, or words without proper citation or attribution.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Common forms:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Copying text from websites without quotation marks</li>
                      <li>• Submitting someone else's assignment as your own</li>
                      <li>• Paraphrasing without crediting the source</li>
                      <li>• Using images or media without permission</li>
                      <li>• Self-plagiarism (reusing your own previous work)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">How to Avoid Plagiarism</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Always cite sources:</strong> Include author, title, date, and URL</p>
                    <p>• <strong>Use quotation marks:</strong> For direct quotes from any source</p>
                    <p>• <strong>Paraphrase properly:</strong> Rewrite in your own words AND cite</p>
                    <p>• <strong>Ask for help:</strong> When unsure about citation requirements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-700">🤖 AI Tool Misuse</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Prohibited AI Usage</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Using artificial intelligence tools like ChatGPT, Claude, or Bard to complete assessments 
                    that should demonstrate your own knowledge.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Examples of violations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Using ChatGPT to answer exam questions</li>
                      <li>• Having AI write your essays or assignments</li>
                      <li>• Using AI to solve math problems during tests</li>
                      <li>• Getting AI to explain concepts during closed-book exams</li>
                      <li>• Using AI translation tools during language assessments</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Appropriate AI Use</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Study preparation:</strong> Use AI to create practice questions</p>
                    <p>• <strong>Concept review:</strong> Get explanations for learning (not during exams)</p>
                    <p>• <strong>Writing assistance:</strong> Only when explicitly permitted by instructor</p>
                    <p>• <strong>Research help:</strong> Generate ideas for topics (not final content)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">🤝 Unauthorized Collaboration</h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">What Counts as Cheating?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Working with others on assignments or exams that are meant to be completed individually.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Violation examples:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Sharing quiz or exam answers with classmates</li>
                      <li>• Working together on individual assignments</li>
                      <li>• Getting help from tutors during exams</li>
                      <li>• Looking at another student's work during tests</li>
                      <li>• Using unauthorized online help forums</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Allowed Collaboration</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Study groups:</strong> Reviewing material together before exams</p>
                    <p>• <strong>Group projects:</strong> When explicitly assigned by instructor</p>
                    <p>• <strong>Peer review:</strong> When part of the assignment requirements</p>
                    <p>• <strong>Discussion forums:</strong> General concept discussions (not answers)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">👤 Impersonation & Identity Fraud</h3>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-2">Identity Violations</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Having someone else complete assignments or exams on your behalf, or misrepresenting your identity.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Serious violations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Having someone else take your exam</li>
                      <li>• Sharing login credentials with others</li>
                      <li>• Taking an exam for another student</li>
                      <li>• Using fake identification during assessments</li>
                      <li>• Submitting work completed by someone else</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Severe Consequences</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Immediate withdrawal</strong> from the course</p>
                    <p>• <strong>Permanent record</strong> of academic dishonesty</p>
                    <p>• <strong>Prohibition</strong> from future RTD Academy enrollment</p>
                    <p>• <strong>Legal action</strong> may be pursued in extreme cases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Real Examples Section */}
      {activeSection === 'examples' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📚 Real Examples of Academic Integrity Violations</h2>
            <p className="text-gray-600 mb-6">
              Learn from actual scenarios that have occurred in online learning environments.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Case Study 1: The ChatGPT Physics Exam</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">What Happened:</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    During a Physics 30 section exam, student "Mike" was observed typing questions directly into ChatGPT 
                    and copying the AI-generated responses into his exam answers.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Evidence observed:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Secondary camera showed ChatGPT website open</li>
                      <li>• Student copying text character-for-character</li>
                      <li>• Answers included AI-typical phrases and formatting</li>
                      <li>• Student attempted to hide screen when noticed</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Consequences Applied:</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Immediate action:</strong> Exam terminated and scored 0%</p>
                    <p><strong>First offense:</strong> Required to complete academic integrity module</p>
                    <p><strong>Re-write opportunity:</strong> Allowed to replace score after completing module</p>
                    <p><strong>Warning:</strong> Second violation would result in course withdrawal</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-yellow-700">
                      <strong>Outcome:</strong> Mike completed the integrity module, passed the re-write exam, 
                      and successfully finished the course without further violations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-orange-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-700">📋 Case Study 2: The Shared Assignment</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">What Happened:</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Two students, "Sarah" and "Alex," submitted nearly identical Math 30-1 assignments with 
                    the same unique errors and formatting.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Red flags identified:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Identical mathematical errors in multiple problems</li>
                      <li>• Same unusual formatting and spacing choices</li>
                      <li>• Similar writing style and explanations</li>
                      <li>• Submitted within minutes of each other</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Investigation & Results:</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Process:</strong> Both students interviewed separately</p>
                    <p><strong>Admission:</strong> Sarah admitted to sharing her completed work</p>
                    <p><strong>Alex's penalty:</strong> Assignment scored 0%, integrity module required</p>
                    <p><strong>Sarah's penalty:</strong> Assignment scored 0% (providing answers is also violation)</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-red-700">
                      <strong>Learning:</strong> Both sharing and receiving academic work constitutes a violation. 
                      Helping friends cheat hurts everyone involved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-purple-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">👥 Case Study 3: The Impersonation Attempt</h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">What Happened:</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Student "Jordan" arranged for his older brother to take his Chemistry 30 section exam, 
                    believing the online format would make detection impossible.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">How it was discovered:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Facial recognition during exam check-in failed</li>
                      <li>• Dramatic improvement in performance was suspicious</li>
                      <li>• Different typing patterns and speed detected</li>
                      <li>• Knowledge level didn't match previous assessments</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Serious Consequences:</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Immediate:</strong> Withdrawn from course with final grade submitted</p>
                    <p><strong>Academic record:</strong> Permanent notation of academic dishonesty</p>
                    <p><strong>Future enrollment:</strong> Prohibited from registering for RTD Academy courses</p>
                    <p><strong>Legal consideration:</strong> Identity fraud reported to authorities</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-red-700">
                      <strong>Impact:</strong> Jordan's academic career was permanently damaged by this single decision. 
                      Impersonation is the most serious form of academic dishonesty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">💡 Lessons Learned</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Technology Can't Hide Violations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Multiple detection methods are in use</li>
                  <li>• Patterns and inconsistencies are tracked</li>
                  <li>• Digital evidence is preserved</li>
                  <li>• Investigation tools are sophisticated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Violations Have Real Consequences:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Academic records are permanent</li>
                  <li>• Future opportunities may be affected</li>
                  <li>• Trust with instructors is damaged</li>
                  <li>• Personal integrity is compromised</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prevention is Key:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Ask questions when policies are unclear</li>
                  <li>• Seek help through appropriate channels</li>
                  <li>• Plan adequate time for assignments</li>
                  <li>• Value learning over grades</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Disciplinary Process Section */}
      {activeSection === 'discipline' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚖️ RTD Academy Disciplinary Process</h2>
            <p className="text-gray-600 mb-6">
              Understand the clear, fair process used to address academic integrity violations.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📋 Investigation Process</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div className="flex-grow">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Initial Detection</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Potential violation is identified through automated systems, instructor observation, or student reports.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Detection methods:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Plagiarism detection software</li>
                          <li>• Proctoring system alerts</li>
                          <li>• Unusual pattern recognition</li>
                          <li>• Instructor review of submissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div className="flex-grow">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Preliminary Investigation</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Course instructor conducts initial review of evidence and documentation.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Investigation includes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Review of submission timestamps</li>
                          <li>• Analysis of work patterns</li>
                          <li>• Comparison with other submissions</li>
                          <li>• Examination of technical evidence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div className="flex-grow">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Student Notification</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Student is informed of the suspected violation and given opportunity to respond.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Notification process:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Formal email with specific allegations</li>
                          <li>• Evidence summary provided</li>
                          <li>• 48-hour response period given</li>
                          <li>• Right to explanation acknowledged</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div className="flex-grow">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Final Decision</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Based on investigation and student response, final decision and consequences are determined.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Decision factors:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Strength of evidence</li>
                          <li>• Student's explanation and response</li>
                          <li>• Previous violation history</li>
                          <li>• Severity of the violation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-700">⚠️ First Offense Consequences</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Standard First Offense Process</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">1. Assessment Scored at 0%</h5>
                      <p className="text-xs text-gray-600">
                        The violated assessment receives a grade of zero percent, regardless of the content submitted.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-blue-700 mb-2">2. Academic Integrity Module Required</h5>
                      <p className="text-xs text-gray-600">
                        Student must complete a comprehensive online module covering academic integrity principles 
                        before continuing with coursework.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-2">3. Re-write Opportunity Available</h5>
                      <p className="text-xs text-gray-600">
                        After completing the integrity module, student may use their course re-write opportunity 
                        to replace the zero grade.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Timeline for First Offense</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• <strong>Day 1:</strong> Violation detected and documented</p>
                    <p>• <strong>Days 2-3:</strong> Student notification and response period</p>
                    <p>• <strong>Day 4:</strong> Decision communicated to student</p>
                    <p>• <strong>Days 5-10:</strong> Academic integrity module must be completed</p>
                    <p>• <strong>After completion:</strong> Re-write becomes available</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Second Offense Consequences</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Immediate Course Withdrawal</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">Automatic Withdrawal</h5>
                      <p className="text-xs text-gray-600">
                        Student is immediately withdrawn from the course with no opportunity for completion or re-write.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-orange-700 mb-2">Current Grade Submitted</h5>
                      <p className="text-xs text-gray-600">
                        The student's grade at the time of violation is calculated and submitted to PASI as the final mark.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-purple-700 mb-2">Future Enrollment Prohibited</h5>
                      <p className="text-xs text-gray-600">
                        Student becomes ineligible to register for any future RTD Academy courses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Permanent Academic Record</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Academic integrity violation noted on transcript</p>
                    <p>• Notification sent to student's home school district</p>
                    <p>• Record maintained in PASI system</p>
                    <p>• May affect post-secondary applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">📊 Violation Severity Guidelines</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-yellow-700">Minor Violations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Inadequate citation in assignments</li>
                  <li>• Small-scale collaboration on individual work</li>
                  <li>• Minor unauthorized resource use</li>
                  <li>• Accidental similarity in responses</li>
                </ul>
                <p className="text-xs text-yellow-600 mt-2">Usually result in standard first offense process</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-700">Moderate Violations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Deliberate use of AI tools during exams</li>
                  <li>• Copying substantial portions of assignments</li>
                  <li>• Sharing answers with other students</li>
                  <li>• Using prohibited resources during tests</li>
                </ul>
                <p className="text-xs text-orange-600 mt-2">May result in enhanced consequences even for first offense</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Severe Violations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Impersonation or identity fraud</li>
                  <li>• Systematic cheating across multiple assessments</li>
                  <li>• Contract cheating or assignment buying</li>
                  <li>• Facilitating violations by others</li>
                </ul>
                <p className="text-xs text-red-600 mt-2">May result in immediate withdrawal even for first offense</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Appeals Policy Section */}
      {activeSection === 'appeals' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📄 Academic Integrity Appeals Policy</h2>
            <p className="text-gray-600 mb-6">
              RTD Academy provides a fair process for students to appeal academic integrity decisions.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">⚖️ Your Right to Appeal</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">When You Can Appeal</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Students may appeal any academic integrity decision if they believe:
                </p>
                
                <div className="bg-white rounded p-3">
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• The investigation was incomplete or unfair</li>
                    <li>• New evidence is available that wasn't considered</li>
                    <li>• The violation finding was based on incorrect information</li>
                    <li>• The consequences applied were disproportionate</li>
                    <li>• Proper procedures were not followed</li>
                    <li>• There were extenuating circumstances not considered</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Appeal Limitations</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Appeals are not appropriate for:
                </p>
                
                <div className="bg-white rounded p-3">
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Disagreeing with academic integrity policies</li>
                    <li>• Requesting different consequences after admitting violation</li>
                    <li>• Seeking to delay the disciplinary process</li>
                    <li>• General dissatisfaction with outcomes</li>
                    <li>• Requesting special treatment not available to others</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📝 Appeal Process Steps</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div className="flex-grow">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Submit Written Appeal (Within 14 Days)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Submit a formal written appeal within 14 calendar days of receiving the integrity decision.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Required information:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Student name and course information</li>
                          <li>• Date and description of original violation</li>
                          <li>• Specific grounds for appeal</li>
                          <li>• New evidence or information (if applicable)</li>
                          <li>• Requested outcome or resolution</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div className="flex-grow">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Initial Review by Administration</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        RTD Academy administration conducts preliminary review to determine if appeal has merit.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Review criteria:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Appeal submitted within deadline</li>
                          <li>• Valid grounds for appeal present</li>
                          <li>• New information is substantive</li>
                          <li>• Original process followed correctly</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div className="flex-grow">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Formal Investigation</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If appeal has merit, a formal investigation is conducted by neutral administrator.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Investigation includes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Review of all original evidence</li>
                          <li>• Examination of new information provided</li>
                          <li>• Interviews with relevant parties</li>
                          <li>• Verification of procedural compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div className="flex-grow">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Final Decision</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Administration renders final decision on appeal and communicates outcome to student.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Possible outcomes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Appeal upheld - original decision reversed</li>
                          <li>• Appeal partially upheld - consequences modified</li>
                          <li>• Appeal denied - original decision stands</li>
                          <li>• Further investigation required</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-700">⏰ Important Deadlines</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Critical Timeline</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-1">14 Calendar Days</h5>
                      <p className="text-xs text-gray-600">
                        Maximum time to submit written appeal from date of original decision notification.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-blue-700 mb-1">5 Business Days</h5>
                      <p className="text-xs text-gray-600">
                        Time for administration to complete initial review and determine if appeal proceeds.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-1">10 Business Days</h5>
                      <p className="text-xs text-gray-600">
                        Maximum time for formal investigation and final decision on appeal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Deadline Consequences</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Appeals submitted after 14 days will not be considered</p>
                    <p>• No extensions granted except for documented emergencies</p>
                    <p>• Original decision becomes final if deadline missed</p>
                    <p>• Course consequences remain in effect during appeal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">📋 How to Submit an Appeal</h3>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-3">Submission Requirements</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-purple-700 mb-1">Email to Principal</h5>
                      <p className="text-xs text-gray-600">
                        Send written appeal to kyle@rtdacademy.com with "Academic Integrity Appeal" in subject line.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-blue-700 mb-1">Required Documentation</h5>
                      <p className="text-xs text-gray-600">
                        Include all relevant evidence, correspondence, and supporting materials with appeal.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-1">Professional Format</h5>
                      <p className="text-xs text-gray-600">
                        Use formal business letter format with clear, respectful language throughout.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Appeal Tips for Success</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Be specific about procedural errors or new evidence</p>
                    <p>• Maintain respectful, professional tone throughout</p>
                    <p>• Provide clear documentation for all claims</p>
                    <p>• Focus on facts rather than emotions</p>
                    <p>• Suggest reasonable resolution if appropriate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Practice Scenarios Section */}
      {activeSection === 'scenarios' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎭 Practice Scenarios: Identifying Integrity Breaches</h2>
            <p className="text-gray-600 mb-6">
              Test your understanding by analyzing realistic academic situations and determining if violations occurred.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📝 Academic Integrity Scenarios</h3>
            <p className="text-sm text-gray-600 mb-6">Read each scenario carefully and decide whether it represents acceptable academic behavior or a violation of RTD Academy's academic integrity policy.</p>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 1: The Study Group Question</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Emma joins a Physics 30 study group where students discuss difficult concepts and work through practice problems together. 
                  During the group session, they review solutions to homework problems that were assigned for individual completion. 
                  Emma realizes her original answers were wrong and revises her homework based on the group discussion before submitting it.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario1"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario1', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - Collaborative learning is encouraged</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario1"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario1', 'violation')}
                    />
                    <span className="text-sm">Violation - Individual work should not be influenced by group answers</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 2: The AI Research Helper</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Carlos is struggling with a Chemistry 30 assignment about molecular structures. He uses ChatGPT to help him understand 
                  the basic concepts and generate practice questions. He then reads his textbook and course materials to find the actual 
                  answers, writing his assignment responses in his own words based on his learning from legitimate sources.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario2"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario2', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - AI was used for learning, not for producing answers</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario2"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario2', 'violation')}
                    />
                    <span className="text-sm">Violation - Any use of AI tools during assignment completion is prohibited</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 3: The Open-Book Exception</h4>
                <p className="text-sm text-gray-700 mb-3">
                  During a Math 30-1 open-book exam, Sofia is allowed to use her textbook, notes, and calculator. She encounters a 
                  problem type she's never seen before and decides to search online for similar examples to understand the approach. 
                  She finds a helpful explanation on Khan Academy and applies the method to solve her exam problem.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario3"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario3', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - Online resources are permitted during open-book exams</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario3"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario3', 'violation')}
                    />
                    <span className="text-sm">Violation - Only specifically authorized materials may be used</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 4: The Technical Difficulty</h4>
                <p className="text-sm text-gray-700 mb-3">
                  During a proctored Biology 30 exam, Marcus's internet connection becomes unstable and he loses audio contact with his instructor. 
                  While waiting for technical support, he continues working on his exam and uses his phone to quickly Google a scientific term 
                  he couldn't remember. He reconnects 10 minutes later and doesn't mention the Google search to his instructor.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario4"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario4', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - Technical difficulties excuse brief rule violations</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario4"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario4', 'violation')}
                    />
                    <span className="text-sm">Violation - Unauthorized resource access and failure to report the incident</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 5: The Peer Collaboration</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Lisa and David are both taking English 30-1 and have been assigned the same novel to read. They decide to read it together, 
                  discussing themes and characters as they go. When it comes time for their individual essay assignments on the novel, 
                  they each write their own essays but share similar insights and interpretations that came from their joint discussions.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario5"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario5', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - Discussion of readings is normal academic behavior</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario5"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario5', 'violation')}
                    />
                    <span className="text-sm">Violation - Individual assignments must reflect independent thought</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 6: The Time Pressure Solution</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Jake is running out of time on his Social Studies 30-1 final project. He finds a well-written essay online that covers 
                  exactly his topic. Instead of copying it directly, he paraphrases several paragraphs and incorporates them into his own work. 
                  He changes the wording significantly and adds his own introduction and conclusion, but doesn't cite the original source.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario6"
                      value="acceptable"
                      className="text-green-600"
                      onChange={() => handleScenarioAnswer('scenario6', 'acceptable')}
                    />
                    <span className="text-sm">Acceptable - Paraphrasing and adding original content transforms the work</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario6"
                      value="violation"
                      className="text-red-600"
                      onChange={() => handleScenarioAnswer('scenario6', 'violation')}
                    />
                    <span className="text-sm">Violation - Using others' ideas without citation is plagiarism</span>
                  </label>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={checkScenarioAnswers}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Check My Answers
                </button>
              </div>

              {showScenarioFeedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Answer Explanations</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p><strong>Scenario 1:</strong> <span className="text-red-600">Violation</span></p>
                      <p className="text-gray-600">Individual homework should reflect your own understanding. While study groups are valuable for learning, submitting revised work based on group answers violates individual assignment requirements.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 2:</strong> <span className="text-red-600">Violation</span></p>
                      <p className="text-gray-600">While Carlos used AI for initial learning, using any AI assistance during assignment completion violates RTD's policy, even if the final answers came from legitimate sources.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 3:</strong> <span className="text-green-600">Acceptable</span></p>
                      <p className="text-gray-600">During open-book exams, students may typically access online educational resources unless specifically prohibited. Khan Academy is a legitimate educational resource.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 4:</strong> <span className="text-red-600">Violation</span></p>
                      <p className="text-gray-600">Marcus committed two violations: using unauthorized resources (Google) during the exam and failing to report this to his instructor when reconnected.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 5:</strong> <span className="text-green-600">Acceptable</span></p>
                      <p className="text-gray-600">Discussing readings and sharing interpretations is normal academic discourse. As long as each student writes their own essay, similar insights from joint learning are acceptable.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 6:</strong> <span className="text-red-600">Violation</span></p>
                      <p className="text-gray-600">This is plagiarism. Paraphrasing without citation is still using others' ideas without credit. All sources must be properly attributed regardless of how much the wording is changed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Drag and Drop Sorting Section */}
      {activeSection === 'sorting' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Ethical vs Unethical: Sorting Activity</h2>
            <p className="text-gray-600 mb-6">
              Drag each academic behavior to the correct category. This will help you distinguish between acceptable and prohibited actions.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">📝 Instructions</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">How to complete this activity:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>1. Read each behavior card carefully</li>
                  <li>2. Drag it to either "Ethical" or "Unethical" column</li>
                  <li>3. Consider RTD Academy's academic integrity policy</li>
                  <li>4. Click "Check My Sorting" when finished</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Think about:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Is this behavior honest and fair?</li>
                  <li>• Does it respect the learning process?</li>
                  <li>• Would it give unfair advantage?</li>
                  <li>• Is it explicitly prohibited by RTD policy?</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Available Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-700">📚 Academic Behaviors</h3>
                <p className="text-sm text-gray-600 mb-4">Drag these items to the appropriate category →</p>
                
                <div className="space-y-3">
                  {dragItems.available.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="p-3 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 cursor-move transition-all hover:shadow-md hover:border-purple-400"
                    >
                      <span className="text-sm font-medium text-purple-800">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethical Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-700">✅ Ethical Behaviors</h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'ethical')}
                  className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-all ${
                    dragItems.ethical.length > 0
                      ? 'border-green-300 bg-green-50'
                      : 'border-green-300 bg-green-50/50 hover:border-green-400'
                  }`}
                >
                  {dragItems.ethical.length > 0 ? (
                    <div className="space-y-3">
                      {dragItems.ethical.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-green-100 border border-green-300"
                        >
                          <span className="text-sm font-medium text-green-800">{item.text}</span>
                          <button
                            onClick={() => {
                              setDragItems(prev => ({
                                ...prev,
                                available: [...prev.available, item],
                                ethical: prev.ethical.filter(i => i.id !== item.id)
                              }));
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic text-center h-full flex items-center justify-center">
                      Drop ethical behaviors here...
                    </div>
                  )}
                </div>
              </div>

              {/* Unethical Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-700">❌ Unethical Behaviors</h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'unethical')}
                  className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-all ${
                    dragItems.unethical.length > 0
                      ? 'border-red-300 bg-red-50'
                      : 'border-red-300 bg-red-50/50 hover:border-red-400'
                  }`}
                >
                  {dragItems.unethical.length > 0 ? (
                    <div className="space-y-3">
                      {dragItems.unethical.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-red-100 border border-red-300"
                        >
                          <span className="text-sm font-medium text-red-800">{item.text}</span>
                          <button
                            onClick={() => {
                              setDragItems(prev => ({
                                ...prev,
                                available: [...prev.available, item],
                                unethical: prev.unethical.filter(i => i.id !== item.id)
                              }));
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic text-center h-full flex items-center justify-center">
                      Drop unethical behaviors here...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {dragItems.available.length === 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={checkSorting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Check My Sorting
                </button>
              </div>
            )}

            {sortingComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-green-800 mb-3">Sorting Results</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p><strong>Correct Placements:</strong></p>
                    <ul className="text-gray-700 mt-1 space-y-1">
                      <li>• <strong>Ethical:</strong> Citing sources, asking clarification, study groups, using approved tools, referencing notes during open-book tests</li>
                      <li>• <strong>Unethical:</strong> Using ChatGPT on exams, sharing answers, copying assignments, impersonation, searching Google during closed-book exams</li>
                    </ul>
                  </div>
                  <p className="text-green-700">
                    Remember: When in doubt about whether a behavior is acceptable, always ask your instructor for clarification before proceeding.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Integrity Pledge Section */}
      {activeSection === 'pledge' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">✋ Academic Integrity Pledge</h2>
            <p className="text-gray-600 mb-6">
              Complete this personalized integrity pledge to demonstrate your commitment to academic honesty at RTD Academy.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">📜 Personal Integrity Commitment</h3>
            
            {!pledgeData.completed ? (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-3">Your Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name:</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter your full name"
                        value={pledgeData.studentName}
                        onChange={(e) => handlePledgeChange('studentName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date:</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                        value={pledgeData.date}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">My Understanding</h4>
                  <label className="block text-sm font-medium mb-2">
                    Explain in your own words what academic integrity means to you:
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Describe your understanding of academic integrity and why it's important..."
                    value={pledgeData.understanding}
                    onChange={(e) => handlePledgeChange('understanding', e.target.value)}
                  />
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">My Commitment</h4>
                  <label className="block text-sm font-medium mb-2">
                    List three specific actions you will take to maintain academic integrity:
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="1. I will... 2. I will... 3. I will..."
                    value={pledgeData.commitment}
                    onChange={(e) => handlePledgeChange('commitment', e.target.value)}
                  />
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">My Acknowledgment</h4>
                  <label className="block text-sm font-medium mb-2">
                    Acknowledge that you understand the consequences of academic integrity violations:
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="I understand that violations may result in..."
                    value={pledgeData.consequences}
                    onChange={(e) => handlePledgeChange('consequences', e.target.value)}
                  />
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Digital Signature</h4>
                  <label className="block text-sm font-medium mb-2">
                    Type your full name as your digital signature:
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your full name"
                    value={pledgeData.signature}
                    onChange={(e) => handlePledgeChange('signature', e.target.value)}
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    By typing your name, you agree to uphold RTD Academy's academic integrity standards.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={completePledge}
                    disabled={!pledgeData.studentName || !pledgeData.understanding || !pledgeData.commitment || !pledgeData.consequences || !pledgeData.signature}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit My Pledge
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-4 text-center">✅ Academic Integrity Pledge Completed</h4>
                
                <div className="bg-white rounded-lg p-6 border-2 border-green-300">
                  <div className="text-center mb-4">
                    <h5 className="text-xl font-bold text-gray-800">RTD Academy Academic Integrity Pledge</h5>
                    <p className="text-gray-600">Certificate of Commitment</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <p>
                      I, <strong>{pledgeData.studentName}</strong>, hereby pledge my commitment to upholding the highest standards 
                      of academic integrity while enrolled at RTD Academy.
                    </p>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium mb-2">My Understanding:</p>
                      <p className="text-gray-700 italic">"{pledgeData.understanding}"</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium mb-2">My Commitments:</p>
                      <p className="text-gray-700 italic">"{pledgeData.commitment}"</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium mb-2">My Acknowledgment:</p>
                      <p className="text-gray-700 italic">"{pledgeData.consequences}"</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div>
                        <p className="font-medium">Digital Signature:</p>
                        <p className="text-gray-700">{pledgeData.signature}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date:</p>
                        <p className="text-gray-700">{pledgeData.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-green-700 font-medium">
                    🎉 Thank you for your commitment to academic integrity!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This pledge demonstrates your understanding and dedication to ethical academic practices.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Academic Integrity Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Demonstrate your comprehensive understanding of RTD Academy's academic integrity policy and disciplinary procedures.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="09_academic_integrity_violation_consequences_practice"
            cloudFunctionName="course4_09_academic_integrity_violation_consequences_aiQuestion"
            title="Advanced Academic Integrity Scenarios"
            theme="red"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 You're Now an Academic Integrity Expert!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
            <ul className="space-y-2 text-red-100">
              <li>✅ RTD Academy's comprehensive academic integrity policy</li>
              <li>✅ Types of violations: plagiarism, AI misuse, collaboration, impersonation</li>
              <li>✅ Real examples and case studies of integrity breaches</li>
              <li>✅ Two-tier disciplinary process and consequences</li>
              <li>✅ Appeals policy and procedures</li>
              <li>✅ Practical scenario analysis and ethical decision-making</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Integrity Toolkit:</h3>
            <div className="space-y-2 text-red-100">
              <p>1. 🧠 Clear understanding of ethical vs unethical behaviors</p>
              <p>2. 📝 Personal integrity pledge and commitment</p>
              <p>3. ⚖️ Knowledge of consequences and appeals process</p>
              <p>4. 🤔 Critical thinking skills for ambiguous situations</p>
              <p>5. 📞 Confidence to ask questions when unsure</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🏆 Remember: Academic integrity is not about perfection—it's about honesty, learning, and growth. 
            When you maintain ethical standards, you develop real skills and knowledge that will serve you throughout life!
          </p>
        </div>
      </section>
    </div>
  );
};

export default AcademicIntegrityViolationConsequences;