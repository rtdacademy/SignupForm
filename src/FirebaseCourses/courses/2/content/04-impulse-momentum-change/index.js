import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 3 - Impulse & Change in Momentum
 * Covers the relationship between force, time, and momentum change
 */
const ImpulseMomentumChange = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Collapsible section states
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);
  const [isExample4Open, setIsExample4Open] = useState(false);
  
  // Animation states
  const [animationTime, setAnimationTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Practice problem states
  const [currentProblemSet1, setCurrentProblemSet1] = useState(0);
  const [currentProblemSet2, setCurrentProblemSet2] = useState(0);

  // Practice problem data for Set 1 (after Example 2)
  const practiceProblems1 = [
    {
      id: 1,
      question: "A 2.0 kg object experiences a force of 15 N for 0.30 s. What is the impulse delivered to the object?",
      given: ["Mass: m = 2.0 kg", "Force: F = 15 N", "Time: Δt = 0.30 s"],
      equation: "J = F\\Delta t",
      solution: "J = (15\\text{ N})(0.30\\text{ s}) = 4.5\\text{ N}\\cdot\\text{s}",
      answer: "4.5 N·s"
    },
    {
      id: 2,
      question: "An impulse of 24 N·s is applied to a 3.0 kg object initially at rest. What is the final velocity of the object?",
      given: ["Mass: m = 3.0 kg", "Impulse: J = 24 N·s", "Initial velocity: v₀ = 0 m/s"],
      equation: "J = m\\Delta v = m(v_f - v_0)",
      solution: "24 = 3.0(v_f - 0) \\Rightarrow v_f = \\frac{24}{3.0} = 8.0\\text{ m/s}",
      answer: "8.0 m/s"
    },
    {
      id: 3,
      question: "A 0.50 kg ball moving at 12 m/s collides with a wall and rebounds at 8.0 m/s. What is the change in momentum?",
      given: ["Mass: m = 0.50 kg", "Initial velocity: v₀ = +12 m/s", "Final velocity: vf = -8.0 m/s"],
      equation: "\\Delta p = m\\Delta v = m(v_f - v_0)",
      solution: "\\Delta p = 0.50(-8.0 - 12) = 0.50(-20) = -10\\text{ kg}\\cdot\\text{m/s}",
      answer: "-10 kg·m/s"
    }
  ];

  // Practice problem data for Set 2 (after Example 3)
  const practiceProblems2 = [
    {
      id: 1,
      question: "A force varies with time as shown: F = 6.0 N from t = 0 to t = 2.0 s, then F = 0 from t = 2.0 s to t = 4.0 s. Calculate the total impulse.",
      given: ["F₁ = 6.0 N for 2.0 s", "F₂ = 0 N for 2.0 s"],
      equation: "J = \\text{Area under F-t graph}",
      solution: "J = F_1 \\times \\Delta t_1 = 6.0\\text{ N} \\times 2.0\\text{ s} = 12\\text{ N}\\cdot\\text{s}",
      answer: "12 N·s"
    },
    {
      id: 2,
      question: "A triangular force profile reaches a maximum of 20 N at t = 1.0 s, starting and ending at 0 N over a total time of 2.0 s. Find the impulse.",
      given: ["Maximum force: F_max = 20 N", "Base time: Δt = 2.0 s", "Triangle shape"],
      equation: "J = \\frac{1}{2} \\times \\text{base} \\times \\text{height}",
      solution: "J = \\frac{1}{2} \\times 2.0\\text{ s} \\times 20\\text{ N} = 20\\text{ N}\\cdot\\text{s}",
      answer: "20 N·s"
    },
    {
      id: 3,
      question: "Calculate the net impulse from t = 0 to t = 6 s for a force that is +8 N from 0-2 s, 0 N from 2-4 s, and -4 N from 4-6 s.",
      given: ["F₁ = +8 N for 2 s", "F₂ = 0 N for 2 s", "F₃ = -4 N for 2 s"],
      equation: "J_{net} = J_1 + J_2 + J_3",
      solution: "J_{net} = (8)(2) + (0)(2) + (-4)(2) = 16 + 0 - 8 = 8\\text{ N}\\cdot\\text{s}",
      answer: "8 N·s"
    }
  ];

  // Navigation functions for practice problems
  const nextProblem1 = () => {
    setCurrentProblemSet1((prev) => (prev + 1) % practiceProblems1.length);
  };

  const prevProblem1 = () => {
    setCurrentProblemSet1((prev) => (prev - 1 + practiceProblems1.length) % practiceProblems1.length);
  };

  const goToProblem1 = (index) => {
    setCurrentProblemSet1(index);
  };

  const nextProblem2 = () => {
    setCurrentProblemSet2((prev) => (prev + 1) % practiceProblems2.length);
  };

  const prevProblem2 = () => {
    setCurrentProblemSet2((prev) => (prev - 1 + practiceProblems2.length) % practiceProblems2.length);
  };

  const goToProblem2 = (index) => {
    setCurrentProblemSet2(index);
  };
  
  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    '2';
  
  // Debug logging
  useEffect(() => {
    console.log("🔥 Rendering ImpulseMomentumChange component with:", {
      course,
      courseId: effectiveCourseId,
      currentUser,
      loading,
      error
    });
  }, [course, effectiveCourseId, currentUser, loading, error]);

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animation effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationTime(prev => (prev + 1) % 6);
      }, 300); // Faster animation
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calculate ball position and state based on time
  const getBallState = (time) => {
    const states = [
      { y: 80, compression: 0, arrow: 'up' },       // t = 0.000s - in air, falling (but arrow shows previous upward motion)
      { y: 20, compression: 0, arrow: 'up' },       // t = 0.001s - touching ground, arrow shows upward force about to act
      { y: 10, compression: 0.7, arrow: 'none' },   // t = 0.002s - more squished, no arrow, moved down to touch ground
      { y: 20, compression: 0, arrow: 'down' },     // t = 0.003s - round again, arrow shows downward velocity
      { y: 80, compression: 0, arrow: 'down' },     // t = 0.004s - in air, moving up (but arrow shows initial downward motion)
      { y: 120, compression: 0, arrow: 'none' }     // t = 0.006s - max height, no arrow
    ];
    return states[time] || states[0];
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281791045_100"
      title="Lesson 3 - Impulse & Change in Momentum"
      metadata={{ estimated_time: '60 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsIntroductionOpen(!isIntroductionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Impulse and Change in Momentum</h3>
            <span className="text-blue-600">{isIntroductionOpen ? '▼' : '▶'}</span>
          </button>

          {isIntroductionOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  According to Newton's 2nd Law of Motion (Physics Principle 1), to change the motion 
                  (i.e. momentum) of an object an unbalanced force must be applied. If, for example, we 
                  want to change the motion of a car we have to apply a force for a given time. Further, 
                  one could apply a large force for a short time or a smaller force for a longer time to 
                  effect the same change in velocity.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Derivation from Newton's 2nd Law:</h4>
                  <p className="mb-3">
                    Beginning with Newton's 2nd Law we can derive a useful equation that describes the 
                    relationship between force (<InlineMath>{'F'}</InlineMath>), time (<InlineMath>{'\\Delta t'}</InlineMath>), 
                    mass (<InlineMath>{'m'}</InlineMath>), and change in velocity (<InlineMath>{'\\Delta v'}</InlineMath>).
                  </p>
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <div className="space-y-2">
                      <div className="text-center">
                        <BlockMath>{'F = ma'}</BlockMath>
                      </div>
                      <div className="text-center">
                        <BlockMath>{'F = m\\frac{\\Delta v}{\\Delta t}'}</BlockMath>
                      </div>
                      <div className="text-center">
                        <BlockMath>{'F\\Delta t = m\\Delta v'}</BlockMath>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-3 text-center italic">
                      This equation is on your formula sheet.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Note:</h4>
                  <p className="text-yellow-900">
                    Recall that <InlineMath>{'\\Delta v'}</InlineMath> means "the change in velocity". 
                    Do not mistake the change in velocity for the final velocity.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3">Key Definitions:</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">Change in Momentum</h5>
                      <p className="text-sm text-green-800 mb-2">
                        The product of mass and change in velocity is the change in momentum:
                      </p>
                      <div className="text-center">
                        <BlockMath>{'\\Delta p = m\\Delta v'}</BlockMath>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">Impulse</h5>
                      <p className="text-sm text-green-800 mb-2">
                        The product of force and time is called the impulse:
                      </p>
                      <div className="text-center">
                        <BlockMath>{'J = F\\Delta t'}</BlockMath>
                      </div>
                      <p className="text-sm text-green-800 mt-2">
                        The impulse that acts on an object results in a change in the object's momentum.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-3">The Impulse-Momentum Theorem:</h4>
                  <div className="text-center mb-3">
                    <BlockMath>{'F\\Delta t = \\Delta p = m\\Delta v'}</BlockMath>
                  </div>
                  <p className="text-purple-900">
                    Since impulse is a combination of force and time, one can apply a large force for a 
                    short time or a small force for a long time or a medium force for a medium time to 
                    achieve the same change in momentum.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Real-World Example:</h4>
                  <p className="text-orange-900 mb-3">
                    Imagine a person jumping off a three-story building. If the person landed on the ground 
                    on her back, she would experience a very large force over a short stopping time. The 
                    force would be large enough to cause significant damage to the body.
                  </p>
                  <p className="text-orange-900 mb-3">
                    However, if she landed on a large piece of foam like they use for pole vaults, her 
                    stopping time would be longer and the force acting on her would be far smaller.
                  </p>
                  <p className="text-orange-900">
                    This is the same idea behind the use of:
                  </p>
                  <ul className="list-disc list-inside text-orange-800 mt-2 ml-4">
                    <li>Elastic ropes for wall climbers</li>
                    <li>Air bags in cars</li>
                    <li>Other safety devices</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1 - Calculating Change in Momentum</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An average force of 17.0 N acts on an object for 0.025 s. What is the change in momentum?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Force: <InlineMath>{'F = 17.0\\text{ N}'}</InlineMath></p>
                        <p>Time: <InlineMath>{'\\Delta t = 0.025\\text{ s}'}</InlineMath></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply the impulse-momentum theorem:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'\\Delta p = F\\Delta t'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Substitute the given values:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'\\Delta p = (17.0\\text{ N})(0.025\\text{ s})'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate the result:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'\\Delta p = 0.425\\text{ N}\\cdot\\text{s}'}</BlockMath>
                      </div>
                      <p className="mt-2 text-center">or</p>
                      <div className="mt-2 text-center">
                        <BlockMath>{'\\Delta p = 0.425\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The change in momentum is <InlineMath>{'\\Delta p = 0.425\\text{ kg}\\cdot\\text{m/s}'}</InlineMath>
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Note that the unit N·s is equivalent to kg·m/s. Why? Impulse (<InlineMath>{'F\\Delta t'}</InlineMath>) is equal 
                      to change in momentum (<InlineMath>{'\\Delta p'}</InlineMath>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample2Open(!isExample2Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 2 - Collision and Momentum Conservation</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.00 kg puck slides to the right at 10.0 m/s on a frictionless surface and collides with a 
                  stationary 8.00 kg puck. The 5.00 kg puck rebounds with a speed of 2.50 m/s.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <h5 className="font-semibold text-gray-700 mb-4">Part A: What is the final velocity of the 8.00 kg puck?</h5>
                  
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  {/* Vector Diagrams */}
                  <div className="mb-6 p-4 bg-gray-50 rounded border overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Before Collision */}
                      <div className="text-center">
                        <h6 className="font-medium text-gray-700 mb-3">Before Collision</h6>
                        <svg width="100%" height="120" viewBox="0 0 300 120" className="border border-gray-300 bg-white rounded max-w-full">
                          <defs>
                            <marker id="arrowBefore" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                            </marker>
                          </defs>
                          
                          {/* Red puck (5.00 kg) moving right */}
                          <circle cx="80" cy="60" r="25" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                          <text x="80" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">5.00 kg</text>
                          
                          {/* Velocity vector for red puck */}
                          <line x1="105" y1="60" x2="155" y2="60" stroke="#000" strokeWidth="3" markerEnd="url(#arrowBefore)"/>
                          <text x="130" y="50" fontSize="11" fill="#000" textAnchor="middle">10.0 m/s</text>
                          
                          {/* Blue puck (8.00 kg) stationary */}
                          <circle cx="220" cy="60" r="30" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                          <text x="220" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">8.00 kg</text>
                          <text x="220" y="105" fontSize="11" fill="#666" textAnchor="middle">at rest</text>
                        </svg>
                      </div>
                      
                      {/* After Collision */}
                      <div className="text-center">
                        <h6 className="font-medium text-gray-700 mb-3">After Collision</h6>
                        <svg width="100%" height="120" viewBox="0 0 300 120" className="border border-gray-300 bg-white rounded max-w-full">
                          <defs>
                            <marker id="arrowAfter1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                            </marker>
                            <marker id="arrowAfter2" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                            </marker>
                          </defs>
                          
                          {/* Red puck (5.00 kg) moving left */}
                          <circle cx="80" cy="60" r="25" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                          <text x="80" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">5.00 kg</text>
                          
                          {/* Velocity vector for red puck (left) */}
                          <line x1="55" y1="60" x2="20" y2="60" stroke="#000" strokeWidth="3" markerEnd="url(#arrowAfter2)"/>
                          <text x="37" y="50" fontSize="11" fill="#000" textAnchor="middle">2.50 m/s</text>
                          
                          {/* Blue puck (8.00 kg) moving right */}
                          <circle cx="220" cy="60" r="30" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                          <text x="220" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">8.00 kg</text>
                          
                          {/* Velocity vector for blue puck */}
                          <line x1="250" y1="60" x2="290" y2="60" stroke="#000" strokeWidth="3" markerEnd="url(#arrowAfter1)"/>
                          <text x="270" y="50" fontSize="11" fill="#000" textAnchor="middle">? m/s</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Mass of puck 1: <InlineMath>{'m_5 = 5.00\\text{ kg}'}</InlineMath></p>
                        <p>Initial velocity of puck 1: <InlineMath>{'v_5 = +10.0\\text{ m/s}'}</InlineMath> (to the right)</p>
                        <p>Final velocity of puck 1: <InlineMath>{'v\'_5 = -2.50\\text{ m/s}'}</InlineMath> (rebounds to the left)</p>
                        <p>Mass of puck 2: <InlineMath>{'m_8 = 8.00\\text{ kg}'}</InlineMath></p>
                        <p>Initial velocity of puck 2: <InlineMath>{'v_8 = 0\\text{ m/s}'}</InlineMath> (stationary)</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply conservation of momentum:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'\\sum p_{\\text{before}} = \\sum p_{\\text{after}}'}</BlockMath>
                        <BlockMath>{'m_5v_5 + m_8v_8 = m_5v\'_5 + m_8v\'_8'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Solve for the final velocity of the 8.00 kg puck:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'v\'_8 = \\frac{m_5v_5 + m_8v_8 - m_5v\'_5}{m_8}'}</BlockMath>
                        <BlockMath>{'v\'_8 = \\frac{(5.00\\text{ kg})(+10.0\\text{ m/s}) + 0 - (5.00\\text{ kg})(-2.50\\text{ m/s})}{8.00\\text{ kg}}'}</BlockMath>
                        <BlockMath>{'v\'_8 = \\frac{50.0 + 0 + 12.5}{8.00}\\text{ m/s}'}</BlockMath>
                        <BlockMath>{'v\'_8 = +7.8125\\text{ m/s or } 7.81\\text{ m/s east}'}</BlockMath>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-4">Part B: What is the change in momentum of each puck?</h5>
                    
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium mb-2">For the 5.00 kg puck:</p>
                        <div className="text-center">
                          <BlockMath>{'\\Delta p_5 = m_5\\Delta v = m_5(v\'_5 - v_5)'}</BlockMath>
                          <BlockMath>{'\\Delta p_5 = 5.00\\text{ kg}(-2.50 - (+10.0))\\text{ m/s}'}</BlockMath>
                          <BlockMath>{'\\Delta p_5 = -62.5\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">For the 8.00 kg puck:</p>
                        <div className="text-center">
                          <BlockMath>{'\\Delta p_8 = m_8\\Delta v = m_8(v\'_8 - v_8)'}</BlockMath>
                          <BlockMath>{'\\Delta p_8 = 8.00\\text{ kg}(+7.8125 - 0)\\text{ m/s}'}</BlockMath>
                          <BlockMath>{'\\Delta p_8 = +62.5\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-4">
                      Note that the changes in momentum are the same value, but for one object it is positive and 
                      the other is negative. This is a consequence of the conservation of momentum – i.e. the total 
                      change in momentum is zero:
                    </p>
                    <div className="text-center mt-2">
                      <BlockMath>{'\\Delta p_{\\text{total}} = \\Delta p_5 + \\Delta p_8 = (-62.5) + (+62.5) = 0\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-4">Part C: If the interaction lasted for 3.0 ms, what average force acted on each mass?</h5>
                    
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium mb-2">Force on the 5.00 kg puck:</p>
                        <div className="text-center">
                          <BlockMath>{'F\\Delta t = \\Delta(mv)'}</BlockMath>
                          <BlockMath>{'F_5 = \\frac{\\Delta(mv)}{\\Delta t}'}</BlockMath>
                          <BlockMath>{'F_5 = \\frac{5.00\\text{ kg}(-2.50 - (+10.0))\\text{ m/s}}{0.0030\\text{ s}}'}</BlockMath>
                          <BlockMath>{'F_5 = -2.08 \\times 10^4\\text{ N}'}</BlockMath>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Force on the 8.00 kg puck:</p>
                        <div className="text-center">
                          <BlockMath>{'F\\Delta t = \\Delta(mv)'}</BlockMath>
                          <BlockMath>{'F_8 = \\frac{\\Delta(mv)}{\\Delta t}'}</BlockMath>
                          <BlockMath>{'F_8 = \\frac{8.00\\text{ kg}(+7.8125 - 0)\\text{ m/s}}{0.0030\\text{ s}}'}</BlockMath>
                          <BlockMath>{'F_8 = +2.08 \\times 10^4\\text{ N}'}</BlockMath>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-4">
                      Note that the forces are equal and opposite – i.e. Newton's 3rd Law of Motion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Practice Problems - Set 1</h3>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            {/* Problem Counter and Indicators */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Problem {currentProblemSet1 + 1} of {practiceProblems1.length}
              </h4>
              <div className="flex items-center space-x-2">
                {practiceProblems1.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToProblem1(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                      index === currentProblemSet1
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Display with 2x2 Grid */}
            <div className="bg-white rounded-lg border border-green-300 p-6 mb-4">
              {/* Question Box */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
                <h5 className="font-semibold text-blue-800 mb-2">Question:</h5>
                <p className="text-blue-900">{practiceProblems1[currentProblemSet1].question}</p>
              </div>

              {/* 2x2 Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Given Values */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">Given:</h5>
                  <ul className="space-y-1">
                    {practiceProblems1[currentProblemSet1].given.map((item, index) => (
                      <li key={index} className="text-gray-700 flex items-center text-sm">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Equation */}
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2">Equation:</h5>
                  <div className="text-center">
                    <BlockMath>{practiceProblems1[currentProblemSet1].equation}</BlockMath>
                  </div>
                </div>

                {/* Solution */}
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <h5 className="font-semibold text-yellow-800 mb-2">Solution:</h5>
                  <div className="text-center">
                    <BlockMath>{practiceProblems1[currentProblemSet1].solution}</BlockMath>
                  </div>
                </div>

                {/* Answer */}
                <div className="bg-green-100 p-4 rounded border border-green-300">
                  <h5 className="font-semibold text-green-800 mb-2">Answer:</h5>
                  <p className="text-green-900 font-medium">
                    {practiceProblems1[currentProblemSet1].answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevProblem1}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <button
                onClick={nextProblem1}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Next
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample3Open(!isExample3Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Analysis of Interactions Involving Impulse</h3>
            <span className="text-blue-600">{isExample3Open ? '▼' : '▶'}</span>
          </button>

          {isExample3Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  In the real world, the change in momentum of an object is rarely due to a constant force 
                  that does not change over time. For example, consider a golf ball bouncing off of a 
                  floor. When the ball strikes the floor the force builds up over time and reaches a 
                  maximum when the ball is at its greatest compression. As the ball rebounds from the 
                  floor, the force decreases to zero over time.
                </p>

                {/* Ball Bouncing Animation */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Golf Ball Bouncing Off Floor</h4>
                  
                  <div className="flex flex-col items-center">
                    {/* Animation Display */}
                    <div className="relative w-full max-w-md mb-4">
                      <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-400 bg-white rounded">
                        {/* Floor */}
                        <rect x="0" y="160" width="400" height="40" fill="#8b7355" />
                        <line x1="0" y1="160" x2="400" y2="160" stroke="#654321" strokeWidth="2" />
                        
                        {/* Define arrow markers */}
                        <defs>
                          <marker id="velocityArrowDown" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                          </marker>
                          <marker id="velocityArrowUp" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                          </marker>
                        </defs>
                        
                        {/* Ball */}
                        <ellipse 
                          cx="200" 
                          cy={160 - getBallState(animationTime).y} 
                          rx={20}
                          ry={20 - getBallState(animationTime).compression * 10}
                          fill="#f8f8f8" 
                          stroke="#333" 
                          strokeWidth="1"
                        />
                        
                        {/* Dimples on golf ball (only when not compressed) */}
                        {getBallState(animationTime).compression < 0.3 && (
                          <>
                            <circle cx="195" cy={155 - getBallState(animationTime).y} r="2" fill="#ddd" />
                            <circle cx="205" cy={155 - getBallState(animationTime).y} r="2" fill="#ddd" />
                            <circle cx="200" cy={165 - getBallState(animationTime).y} r="2" fill="#ddd" />
                          </>
                        )}
                        
                        {/* Velocity arrows */}
                        {getBallState(animationTime).arrow === 'down' && (
                          <>
                            <line 
                              x1="200" 
                              y1={130 - getBallState(animationTime).y} 
                              x2="200" 
                              y2={90 - getBallState(animationTime).y} 
                              stroke="#2563eb" 
                              strokeWidth="3" 
                              markerEnd="url(#velocityArrowDown)"
                            />
                            <text x="210" y={110 - getBallState(animationTime).y} fontSize="12" fill="#2563eb">v</text>
                          </>
                        )}
                        
                        {getBallState(animationTime).arrow === 'up' && (
                          <>
                            <line 
                              x1="200" 
                              y1={190 - getBallState(animationTime).y} 
                              x2="200" 
                              y2={230 - getBallState(animationTime).y} 
                              stroke="#2563eb" 
                              strokeWidth="3" 
                              markerEnd="url(#velocityArrowUp)"
                            />
                            <text x="210" y={210 - getBallState(animationTime).y} fontSize="12" fill="#2563eb">v</text>
                          </>
                        )}
                        
                        {/* Time display */}
                        <text x="10" y="20" fontSize="14" fill="#333" fontWeight="bold">
                          t = {animationTime === 5 ? '0.006' : (animationTime * 0.001).toFixed(3)} s
                        </text>
                      </svg>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {isPlaying ? 'Stop' : 'Play'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setAnimationTime((prev) => (prev - 1 + 6) % 6);
                        }}
                        disabled={isPlaying}
                        className={`px-4 py-2 rounded transition-colors ${
                          isPlaying 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        ← Step
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setAnimationTime((prev) => (prev + 1) % 6);
                        }}
                        disabled={isPlaying}
                        className={`px-4 py-2 rounded transition-colors ${
                          isPlaying 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Step →
                      </button>
                    </div>
                    
                    {/* Time indicators */}
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setIsPlaying(false);
                            setAnimationTime(time);
                          }}
                          className={`w-16 h-8 text-xs rounded transition-colors ${
                            animationTime === time 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {time === 5 ? '0.006s' : `${(time * 0.001).toFixed(3)}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-3">Force-Time Analysis:</h4>
                  <p className="text-indigo-900 mb-4">
                    A force-time diagram showing the impulse acting on the ball will look something like the following:
                  </p>
                  
                  {/* Force-Time Graphs */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Left graph: Curved force-time for golf ball */}
                    <div className="bg-white p-4 rounded border border-indigo-300">
                      <h5 className="text-center font-medium text-gray-700 mb-3">Force-Time Graph for Golf Ball</h5>
                      <svg width="100%" height="250" viewBox="0 0 300 250" className="border border-gray-300">
                        {/* Grid lines first */}
                        <line x1="40" y1="160" x2="260" y2="160" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="120" x2="260" y2="120" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="80" x2="260" y2="80" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="40" x2="260" y2="40" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        
                        {/* Curved force profile - normal distribution-like curve with rounded top */}
                        <path
                          d="M 40 200 C 60 200 80 195 95 160 C 105 135 115 95 125 80 Q 130 75 135 80 C 145 95 155 135 165 160 C 180 195 200 200 220 200 L 220 200 L 40 200 Z"
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#3b82f6"
                          strokeWidth="3"
                        />
                        
                        {/* Area label */}
                        <text x="130" y="130" fontSize="13" fill="#3b82f6" textAnchor="middle" fontWeight="bold">
                          Area = Impulse
                        </text>
                        <text x="130" y="145" fontSize="11" fill="#3b82f6" textAnchor="middle">
                          J = F∆t
                        </text>
                        
                        {/* Axes - drawn last to appear on top */}
                        <line x1="40" y1="200" x2="260" y2="200" stroke="#333" strokeWidth="2"/>
                        <line x1="40" y1="200" x2="40" y2="30" stroke="#333" strokeWidth="2"/>
                        
                        {/* Axis labels */}
                        <text x="150" y="235" fontSize="14" textAnchor="middle">Time (ms)</text>
                        <text x="10" y="115" fontSize="14" textAnchor="middle" transform="rotate(-90 10 115)">Force (N)</text>
                        
                        {/* Time axis markings */}
                        <text x="40" y="215" fontSize="11" textAnchor="middle">0</text>
                        <text x="100" y="215" fontSize="11" textAnchor="middle">1</text>
                        <text x="160" y="215" fontSize="11" textAnchor="middle">2</text>
                        <text x="220" y="215" fontSize="11" textAnchor="middle">3</text>
                        
                        {/* Force axis markings */}
                        <text x="30" y="205" fontSize="11" textAnchor="end">0</text>
                        <text x="30" y="165" fontSize="11" textAnchor="end">500</text>
                        <text x="30" y="125" fontSize="11" textAnchor="end">1000</text>
                        <text x="30" y="85" fontSize="11" textAnchor="end">1500</text>
                        <text x="30" y="45" fontSize="11" textAnchor="end">2000</text>
                      </svg>
                    </div>
                    
                    {/* Right graph: Rectangular force-time for comparison */}
                    <div className="bg-white p-4 rounded border border-indigo-300">
                      <h5 className="text-center font-medium text-gray-700 mb-3">Force-Time for Constant Force (for comparison)</h5>
                      <svg width="100%" height="250" viewBox="0 0 300 250" className="border border-gray-300">
                        {/* Grid lines first */}
                        <line x1="40" y1="160" x2="260" y2="160" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="120" x2="260" y2="120" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="80" x2="260" y2="80" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="40" y1="40" x2="260" y2="40" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2"/>
                        
                        {/* Rectangular force profile - extends across full time range */}
                        <rect x="40" y="80" width="220" height="120" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="3"/>
                        
                        {/* Area label */}
                        <text x="150" y="130" fontSize="13" fill="#22c55e" textAnchor="middle" fontWeight="bold">
                          Area = Impulse
                        </text>
                        <text x="150" y="145" fontSize="11" fill="#22c55e" textAnchor="middle">
                          J = F∆t = 600N × 0.03s
                        </text>
                        <text x="150" y="160" fontSize="11" fill="#22c55e" textAnchor="middle">
                          = 18 N·s
                        </text>
                        
                        {/* Axes - drawn last to appear on top */}
                        <line x1="40" y1="200" x2="260" y2="200" stroke="#333" strokeWidth="2"/>
                        <line x1="40" y1="200" x2="40" y2="30" stroke="#333" strokeWidth="2"/>
                        
                        {/* Axis labels */}
                        <text x="150" y="235" fontSize="14" textAnchor="middle">Time (s)</text>
                        <text x="10" y="115" fontSize="14" textAnchor="middle" transform="rotate(-90 10 115)">Force (N)</text>
                        
                        {/* Time axis markings */}
                        <text x="40" y="215" fontSize="11" textAnchor="middle">0</text>
                        <text x="100" y="215" fontSize="11" textAnchor="middle">0.01</text>
                        <text x="160" y="215" fontSize="11" textAnchor="middle">0.02</text>
                        <text x="220" y="215" fontSize="11" textAnchor="middle">0.03</text>
                        
                        {/* Force axis markings */}
                        <text x="30" y="205" fontSize="11" textAnchor="end">0</text>
                        <text x="30" y="165" fontSize="11" textAnchor="end">200</text>
                        <text x="30" y="125" fontSize="11" textAnchor="end">400</text>
                        <text x="30" y="85" fontSize="11" textAnchor="end">600</text>
                        <text x="30" y="45" fontSize="11" textAnchor="end">800</text>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-sm text-indigo-800 mt-4 text-center italic">
                    The impulse may be found by calculating the area under the force–time graph. Notice how different force profiles 
                    can produce the same total impulse (area).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample4Open(!isExample4Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 3 - Force on a Ball as a Function of Time</h3>
            <span className="text-blue-600">{isExample4Open ? '▼' : '▶'}</span>
          </button>

          {isExample4Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  Calculate the net impulse delivered to the ball from t = 0.0 s to t = 7.0 s using the force-time graph shown below.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  <p className="mb-4">
                    The net impulse can be calculated as the area of the force-time graph.
                  </p>
                  
                  {/* Force-Time Graph with Area Calculations */}
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <svg width="100%" height="400" viewBox="0 0 600 400" className="border border-gray-400 bg-white rounded">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="600" height="400" fill="url(#grid)" />
                      
                      {/* Major grid lines */}
                      <line x1="50" y1="40" x2="50" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="100" y1="40" x2="100" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="150" y1="40" x2="150" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="200" y1="40" x2="200" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="250" y1="40" x2="250" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="300" y1="40" x2="300" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="350" y1="40" x2="350" y2="360" stroke="#ddd" strokeWidth="1"/>
                      <line x1="400" y1="40" x2="400" y2="360" stroke="#ddd" strokeWidth="1"/>
                      
                      <line x1="50" y1="60" x2="400" y2="60" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="100" x2="400" y2="100" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="140" x2="400" y2="140" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="180" x2="400" y2="180" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="220" x2="400" y2="220" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="260" x2="400" y2="260" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="300" x2="400" y2="300" stroke="#ddd" strokeWidth="1"/>
                      <line x1="50" y1="340" x2="400" y2="340" stroke="#ddd" strokeWidth="1"/>
                      
                      {/* Shaded areas representing impulse */}
                      {/* Area 1: Trapezoid from 0-2s */}
                      <path d="M 50 200 L 150 60 L 150 200 Z" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"/>
                      
                      {/* Area 2: Rectangle from 2-4s */}
                      <rect x="150" y="60" width="100" height="140" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"/>
                      
                      {/* Area 3: Trapezoid from 4-5s */}
                      <path d="M 250 60 L 250 200 L 300 200 Z" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"/>
                      
                      {/* Area 4: Trapezoid from 5-6s */}
                      <path d="M 300 200 L 350 340 L 350 200 Z" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2"/>
                      
                      {/* Area 5: Rectangle from 6-7s */}
                      <rect x="350" y="200" width="50" height="140" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2"/>
                      
                      {/* Force line graph - points: (0,0),(2,8),(4,8),(5,0),(6,-8),(7,-8) */}
                      <polyline 
                        points="50,200 150,60 250,60 300,200 350,340 400,340"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                      />
                      
                      {/* Axes */}
                      <line x1="50" y1="200" x2="420" y2="200" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                      <line x1="50" y1="360" x2="50" y2="30" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                      
                      {/* Arrow markers */}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
                        </marker>
                      </defs>
                      
                      {/* Axis labels */}
                      <text x="450" y="205" fontSize="16" fontWeight="bold">t (s)</text>
                      <text x="20" y="25" fontSize="16" fontWeight="bold">F (N)</text>
                      
                      {/* Time axis values */}
                      <text x="50" y="380" fontSize="14" textAnchor="middle">0</text>
                      <text x="100" y="380" fontSize="14" textAnchor="middle">1</text>
                      <text x="150" y="380" fontSize="14" textAnchor="middle">2</text>
                      <text x="200" y="380" fontSize="14" textAnchor="middle">3</text>
                      <text x="250" y="380" fontSize="14" textAnchor="middle">4</text>
                      <text x="300" y="380" fontSize="14" textAnchor="middle">5</text>
                      <text x="350" y="380" fontSize="14" textAnchor="middle">6</text>
                      <text x="400" y="380" fontSize="14" textAnchor="middle">7</text>
                      
                      {/* Force axis values - scale of 2 */}
                      <text x="35" y="65" fontSize="14" textAnchor="end">8</text>
                      <text x="35" y="105" fontSize="14" textAnchor="end">6</text>
                      <text x="35" y="145" fontSize="14" textAnchor="end">4</text>
                      <text x="35" y="185" fontSize="14" textAnchor="end">2</text>
                      <text x="35" y="205" fontSize="14" textAnchor="end">0</text>
                      <text x="35" y="225" fontSize="14" textAnchor="end">-2</text>
                      <text x="35" y="265" fontSize="14" textAnchor="end">-4</text>
                      <text x="35" y="305" fontSize="14" textAnchor="end">-6</text>
                      <text x="35" y="345" fontSize="14" textAnchor="end">-8</text>
                      
                      {/* Area calculations labels */}
                      <text x="110" y="160" fontSize="12" textAnchor="middle" fill="#22c55e" fontWeight="bold">+8</text>
                      <text x="200" y="130" fontSize="12" textAnchor="middle" fill="#22c55e" fontWeight="bold">+16</text>
                      <text x="265" y="160" fontSize="12" textAnchor="middle" fill="#22c55e" fontWeight="bold">+4</text>
                      <text x="330" y="250" fontSize="12" textAnchor="middle" fill="#ef4444" fontWeight="bold">-4</text>
                      <text x="375" y="270" fontSize="12" textAnchor="middle" fill="#ef4444" fontWeight="bold">-8</text>
                    </svg>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-3">Area Calculations:</h5>
                    <div className="space-y-2">
                      <p>Area 1 (0-2s): <InlineMath>{'\\frac{1}{2} \\times 8 \\times 2 = +8\\text{ N}\\cdot\\text{s}'}</InlineMath> (triangle)</p>
                      <p>Area 2 (2-4s): <InlineMath>{'8 \\times 2 = +16\\text{ N}\\cdot\\text{s}'}</InlineMath> (rectangle)</p>
                      <p>Area 3 (4-5s): <InlineMath>{'\\frac{1}{2} \\times 8 \\times 1 = +4\\text{ N}\\cdot\\text{s}'}</InlineMath> (triangle)</p>
                      <p>Area 4 (5-6s): <InlineMath>{'\\frac{1}{2} \\times (-8) \\times 1 = -4\\text{ N}\\cdot\\text{s}'}</InlineMath> (triangle)</p>
                      <p>Area 5 (6-7s): <InlineMath>{'(-8) \\times 1 = -8\\text{ N}\\cdot\\text{s}'}</InlineMath> (rectangle)</p>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\text{Net Impulse} = (+8) + (+16) + (+4) + (-4) + (-8) = +16\\text{ N}\\cdot\\text{s}'}</BlockMath>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The net impulse delivered to the ball from t = 0.0 s to t = 7.0 s is <InlineMath>{'+16\\text{ N}\\cdot\\text{s}'}</InlineMath>
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Note: The positive areas represent impulse in one direction, while negative areas represent impulse in the opposite direction. 
                      The net impulse is the algebraic sum of all areas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Practice Problems - Set 2</h3>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            {/* Problem Counter and Indicators */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Problem {currentProblemSet2 + 1} of {practiceProblems2.length}
              </h4>
              <div className="flex items-center space-x-2">
                {practiceProblems2.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToProblem2(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                      index === currentProblemSet2
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Display with 2x2 Grid */}
            <div className="bg-white rounded-lg border border-green-300 p-6 mb-4">
              {/* Question Box */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
                <h5 className="font-semibold text-blue-800 mb-2">Question:</h5>
                <p className="text-blue-900">{practiceProblems2[currentProblemSet2].question}</p>
              </div>

              {/* 2x2 Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Given Values */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">Given:</h5>
                  <ul className="space-y-1">
                    {practiceProblems2[currentProblemSet2].given.map((item, index) => (
                      <li key={index} className="text-gray-700 flex items-center text-sm">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Equation */}
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2">Equation:</h5>
                  <div className="text-center">
                    <BlockMath>{practiceProblems2[currentProblemSet2].equation}</BlockMath>
                  </div>
                </div>

                {/* Solution */}
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <h5 className="font-semibold text-yellow-800 mb-2">Solution:</h5>
                  <div className="text-center">
                    <BlockMath>{practiceProblems2[currentProblemSet2].solution}</BlockMath>
                  </div>
                </div>

                {/* Answer */}
                <div className="bg-green-100 p-4 rounded border border-green-300">
                  <h5 className="font-semibold text-green-800 mb-2">Answer:</h5>
                  <p className="text-green-900 font-medium">
                    {practiceProblems2[currentProblemSet2].answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevProblem2}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <button
                onClick={nextProblem2}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Next
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      </TextSection>

      <LessonSummary
        points={[
          "Impulse is the product of force and time: J = F∆t",
          "Change in momentum is the product of mass and change in velocity: ∆p = m∆v",
          "The impulse-momentum theorem states that impulse equals change in momentum: F∆t = ∆p",
          "The same change in momentum can be achieved with different combinations of force and time",
          "Safety devices work by increasing the time of impact, thereby reducing the force experienced"
        ]}
      />
    </LessonContent>
  );
};

export default ImpulseMomentumChange;