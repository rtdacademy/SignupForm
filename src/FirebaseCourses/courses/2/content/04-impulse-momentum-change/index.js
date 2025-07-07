import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import { useLessonMetadata } from '../../../../hooks/useLessonConfig';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 3 - Impulse & Change in Momentum
 * Covers the relationship between force, time, and momentum change
 */
const ImpulseMomentumChange = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  
  // Get lesson metadata from course config
  const { metadata } = useLessonMetadata(courseId, '04-impulse-momentum-change');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
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
      metadata={metadata}
    >
      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Impulse and Change in Momentum" 
            value="impulse-and-change-in-momentum" 
            onAskAI={onAIAccordionContent}
          >
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
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Impulse and Change in Momentum</h3>
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
      
      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 1 - Calculating Change in Momentum" 
              value="example-1-calculating-change-in-momentum" 
              onAskAI={onAIAccordionContent}
            >
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
                      <p>Find: Change in momentum (<InlineMath>{'\\Delta p'}</InlineMath>)</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2">
                      <BlockMath>{'F\\Delta t = \\Delta p'}</BlockMath>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute and solve:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center">
                        <BlockMath>{'\\Delta p = F\\Delta t = (17.0\\text{ N})(0.025\\text{ s})'}</BlockMath>
                      </div>
                      <div className="text-center">
                        <BlockMath>{'\\Delta p = 0.43\\text{ N}\\cdot\\text{s} = 0.43\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                </ol>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The change in momentum is <InlineMath>{'0.43\\text{ kg}\\cdot\\text{m/s}'}</InlineMath>
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1 - Calculating Change in Momentum</h3>
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
                      <p>Find: Change in momentum (<InlineMath>{'\\Delta p'}</InlineMath>)</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2">
                      <BlockMath>{'F\\Delta t = \\Delta p'}</BlockMath>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute and solve:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center">
                        <BlockMath>{'\\Delta p = F\\Delta t = (17.0\\text{ N})(0.025\\text{ s})'}</BlockMath>
                      </div>
                      <div className="text-center">
                        <BlockMath>{'\\Delta p = 0.43\\text{ N}\\cdot\\text{s} = 0.43\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                </ol>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The change in momentum is <InlineMath>{'0.43\\text{ kg}\\cdot\\text{m/s}'}</InlineMath>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 2 - Puck Collision Problem" 
            value="example-2-puck-collision-problem" 
            onAskAI={onAIAccordionContent}
          >
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.00 kg puck slides to the right at 10.0 m/s on a frictionless surface and collides with a 
                  stationary 8.00 kg puck. The 5.00 kg puck rebounds with a speed of 2.50 m/s.
                </p>
                
                {/* Visual diagram of the collision */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3">Collision Diagram:</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before collision */}
                    <div className="bg-white p-4 rounded border border-gray-300">
                      <h6 className="font-semibold text-center mb-3">Before Collision</h6>
                      <svg width="100%" height="120" viewBox="0 0 300 120" className="border border-gray-200 bg-blue-50 rounded">
                        {/* Puck 1 - moving */}
                        <circle cx="80" cy="60" r="25" fill="#FF6B6B" stroke="#D63031" strokeWidth="2"/>
                        <text x="80" y="65" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">5.00kg</text>
                        
                        {/* Puck 2 - stationary */}
                        <circle cx="220" cy="60" r="30" fill="#74B9FF" stroke="#0984E3" strokeWidth="2"/>
                        <text x="220" y="65" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">8.00kg</text>
                        
                        {/* Velocity arrow for puck 1 */}
                        <line x1="110" y1="60" x2="140" y2="60" stroke="#00B894" strokeWidth="3"/>
                        <polygon points="135,56 150,60 135,64" fill="#00B894"/>
                        <text x="130" y="45" fontSize="10" textAnchor="middle" fill="#00B894" fontWeight="bold">10.0 m/s</text>
                        
                        {/* Velocity label for puck 2 */}
                        <text x="220" y="95" fontSize="10" textAnchor="middle" fill="#636E72">v = 0 m/s</text>
                      </svg>
                    </div>
                    
                    {/* After collision */}
                    <div className="bg-white p-4 rounded border border-gray-300">
                      <h6 className="font-semibold text-center mb-3">After Collision</h6>
                      <svg width="100%" height="120" viewBox="0 0 300 120" className="border border-gray-200 bg-green-50 rounded">
                        {/* Puck 1 - rebounds */}
                        <circle cx="80" cy="60" r="25" fill="#FF6B6B" stroke="#D63031" strokeWidth="2"/>
                        <text x="80" y="65" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">5.00kg</text>
                        
                        {/* Puck 2 - moving */}
                        <circle cx="220" cy="60" r="30" fill="#74B9FF" stroke="#0984E3" strokeWidth="2"/>
                        <text x="220" y="65" fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">8.00kg</text>
                        
                        {/* Velocity arrow for puck 1 (backwards) */}
                        <line x1="70" y1="60" x2="40" y2="60" stroke="#E17055" strokeWidth="3"/>
                        <polygon points="45,56 30,60 45,64" fill="#E17055"/>
                        <text x="50" y="45" fontSize="10" textAnchor="middle" fill="#E17055" fontWeight="bold">2.50 m/s</text>
                        
                        {/* Velocity arrow for puck 2 (forward) */}
                        <line x1="250" y1="60" x2="280" y2="60" stroke="#00B894" strokeWidth="3"/>
                        <polygon points="275,56 290,60 275,64" fill="#00B894"/>
                        <text x="270" y="45" fontSize="10" textAnchor="middle" fill="#00B894" fontWeight="bold">v₈ = ?</text>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <h5 className="font-semibold text-gray-800 mb-4">Part A: What is the final velocity of the 8.00 kg puck?</h5>
                  
                  <p className="mb-3">
                    <strong>Conservation of Momentum:</strong>
                  </p>
                  <div className="text-center mb-3">
                    <BlockMath>{'\\sum p_{\\text{before}} = \\sum p_{\\text{after}}'}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'m_5v_5 + m_8v_8 = m_5v_5\' + m_8v_8\''}</BlockMath>
                  </div>
                  
                  <p className="mb-2">
                    <strong>Substitute known values:</strong>
                  </p>
                  <div className="text-center mb-4">
                    <BlockMath>{'5.00\\text{ kg}(+10.0\\text{ m/s}) + 8.00\\text{ kg}(0) = 5.00\\text{ kg}(-2.50\\text{ m/s}) + 8.00\\text{ kg}(v_8\')'}</BlockMath>
                  </div>
                  
                  <p className="mb-2">
                    <strong>Solve for v₈':</strong>
                  </p>
                  <div className="text-center mb-2">
                    <BlockMath>{'50.0 + 0 = -12.5 + 8.00v_8\''}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'v_8\' = \\frac{50.0 + 12.5}{8.00} = \\frac{62.5}{8.00} = 7.8125\\text{ m/s}'}</BlockMath>
                  </div>
                  
                  <p className="font-semibold text-gray-800 border-t pt-3">
                    Answer A: The final velocity of the 8.00 kg puck is <InlineMath>{'7.8125\\text{ m/s}'}</InlineMath> to the right (east).
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100 mt-4">
                  <h5 className="font-semibold text-gray-800 mb-4">Part B: What is the change in momentum of each puck?</h5>
                  
                  <p className="mb-3">
                    <strong>For the 5.00 kg puck:</strong>
                  </p>
                  <div className="text-center mb-2">
                    <BlockMath>{'\\Delta p_5 = m_5(v_f - v_i)'}</BlockMath>
                  </div>
                  <div className="text-center mb-2">
                    <BlockMath>{'\\Delta p_5 = 5.00\\text{ kg}(-2.50 - (+10.0))\\text{ m/s}'}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'\\Delta p_5 = -62.5\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                  </div>
                  
                  <p className="mb-3">
                    <strong>For the 8.00 kg puck:</strong>
                  </p>
                  <div className="text-center mb-2">
                    <BlockMath>{'\\Delta p_8 = m_8(v_f - v_i)'}</BlockMath>
                  </div>
                  <div className="text-center mb-2">
                    <BlockMath>{'\\Delta p_8 = 8.00\\text{ kg}(+7.8125 - 0)\\text{ m/s}'}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'\\Delta p_8 = +62.5\\text{ kg}\\cdot\\text{m/s}'}</BlockMath>
                  </div>
                  
                  <p className="mb-2">
                    <strong>Important Note:</strong> The changes in momentum are equal in magnitude but opposite in direction. This demonstrates conservation of momentum:
                  </p>
                  <div className="text-center mb-4">
                    <BlockMath>{'\\Delta p_{\\text{total}} = \\Delta p_5 + \\Delta p_8 = (-62.5) + (+62.5) = 0'}</BlockMath>
                  </div>
                  
                  <p className="font-semibold text-gray-800 border-t pt-3">
                    Answer B: <br/>
                    5.00 kg puck: <InlineMath>{'-62.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath><br/>
                    8.00 kg puck: <InlineMath>{'+62.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath>
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100 mt-4">
                  <h5 className="font-semibold text-gray-800 mb-4">Part C: If the interaction lasted for 3.0 ms, what average force acted on each mass?</h5>
                  
                  <p className="mb-3">
                    <strong>Using the Impulse-Momentum Theorem:</strong>
                  </p>
                  <div className="text-center mb-4">
                    <BlockMath>{'F\\Delta t = \\Delta p \\Rightarrow F = \\frac{\\Delta p}{\\Delta t}'}</BlockMath>
                  </div>
                  
                  <p className="mb-3">
                    <strong>Force on 5.00 kg puck:</strong>
                  </p>
                  <div className="text-center mb-2">
                    <BlockMath>{'F_5 = \\frac{\\Delta p_5}{\\Delta t}'}</BlockMath>
                  </div>
                  <div className="text-center mb-2">
                    <BlockMath>{'F_5 = \\frac{-62.5\\text{ kg}\\cdot\\text{m/s}}{0.0030\\text{ s}}'}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'F_5 = -20833\\text{ N}'}</BlockMath>
                  </div>
                  
                  <p className="mb-3">
                    <strong>Force on 8.00 kg puck:</strong>
                  </p>
                  <div className="text-center mb-2">
                    <BlockMath>{'F_8 = \\frac{\\Delta p_8}{\\Delta t}'}</BlockMath>
                  </div>
                  <div className="text-center mb-2">
                    <BlockMath>{'F_8 = \\frac{+62.5\\text{ kg}\\cdot\\text{m/s}}{0.0030\\text{ s}}'}</BlockMath>
                  </div>
                  <div className="text-center mb-4">
                    <BlockMath>{'F_8 = +20833\\text{ N}'}</BlockMath>
                  </div>
                  
                  <p className="mb-4">
                    <strong>Newton's 3rd Law:</strong> Note that the forces are equal in magnitude but opposite in direction. This demonstrates Newton's 3rd Law of Motion: for every action, there is an equal and opposite reaction.
                  </p>
                  
                  <p className="font-semibold text-gray-800 border-t pt-3">
                    Answer C: <br/>
                    Force on 5.00 kg puck: <InlineMath>{'20833\\text{ N}'}</InlineMath> to the left<br/>
                    Force on 8.00 kg puck: <InlineMath>{'20833\\text{ N}'}</InlineMath> to the right
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
                  <p className="text-sm text-gray-700">
                    <strong>Reference:</strong> Refer to Pearson pages 454 to 467 for a discussion about impulse and change in momentum.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2 - Puck Collision Problem</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                A 5.00 kg puck slides to the right at 10.0 m/s on a frictionless surface and collides with a 
                stationary 8.00 kg puck. The 5.00 kg puck rebounds with a speed of 2.50 m/s.
              </p>
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      <TextSection>
        <SlideshowKnowledgeCheck
          courseId="2"
          lessonPath="04-impulse-momentum-change-basics"
          questions={[
            {
              type: 'multiple-choice',
              question: 'Basic Impulse Calculation',
              questionId: 'course2_04_basic_impulse',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Person Falling and Landing',
              questionId: 'course2_04_person_falling',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Impulse Calculation Methods',
              questionId: 'course2_04_impulse_quantities',
              points: 2
            },
            {
              type: 'multiple-choice',
              question: 'Karate Board Breaking Physics',
              questionId: 'course2_04_karate_board',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Safety Features and Impulse',
              questionId: 'course2_04_safety_features',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Golf Ball Driver Analysis',
              questionId: 'course2_04_golf_ball_driver',
              points: 4
            }
          ]}
          theme="blue"
        />
      </TextSection>

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Analysis of Interactions Involving Impulse" 
            value="analysis-of-interactions-involving-impulse" 
            onAskAI={onAIAccordionContent}
          >
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="mb-4">
                    In the real world, the change in momentum of an object is rarely due to a constant force 
                    that does not change over time. For example, consider a golf ball bouncing off of a 
                    floor. When the ball strikes the floor the force builds up over time and reaches a 
                    maximum when the ball is at its greatest compression. As the ball rebounds from the 
                    floor, the force decreases to zero over time.
                  </p>
                  
                  <h5 className="font-semibold text-gray-800 mb-4">Golf ball bouncing off floor</h5>
                  
                  {/* Golf ball animation sequence */}
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div className="grid grid-cols-5 gap-2">
                      {/* t = 0.000s */}
                      <div className="text-center">
                        <svg width="100%" height="80" viewBox="0 0 60 80" className="bg-white rounded border">
                          {/* Ground */}
                          <rect x="0" y="70" width="60" height="10" fill="#8B5A2B"/>
                          {/* Ball - in air */}
                          <circle cx="30" cy="20" r="8" fill="#FFD93D" stroke="#F39C12" strokeWidth="1"/>
                        </svg>
                        <p className="text-xs mt-1">t = 0.000 s</p>
                      </div>
                      
                      {/* t = 0.001s */}
                      <div className="text-center">
                        <svg width="100%" height="80" viewBox="0 0 60 80" className="bg-white rounded border">
                          {/* Ground */}
                          <rect x="0" y="70" width="60" height="10" fill="#8B5A2B"/>
                          {/* Ball - touching ground */}
                          <circle cx="30" cy="62" r="8" fill="#FFD93D" stroke="#F39C12" strokeWidth="1"/>
                        </svg>
                        <p className="text-xs mt-1">t = 0.001 s</p>
                      </div>
                      
                      {/* t = 0.002s */}
                      <div className="text-center">
                        <svg width="100%" height="80" viewBox="0 0 60 80" className="bg-white rounded border">
                          {/* Ground */}
                          <rect x="0" y="70" width="60" height="10" fill="#8B5A2B"/>
                          {/* Ball - compressed */}
                          <ellipse cx="30" cy="66" rx="10" ry="4" fill="#FFD93D" stroke="#F39C12" strokeWidth="1"/>
                        </svg>
                        <p className="text-xs mt-1">t = 0.002 s</p>
                      </div>
                      
                      {/* t = 0.003s */}
                      <div className="text-center">
                        <svg width="100%" height="80" viewBox="0 0 60 80" className="bg-white rounded border">
                          {/* Ground */}
                          <rect x="0" y="70" width="60" height="10" fill="#8B5A2B"/>
                          {/* Ball - round again */}
                          <circle cx="30" cy="62" r="8" fill="#FFD93D" stroke="#F39C12" strokeWidth="1"/>
                        </svg>
                        <p className="text-xs mt-1">t = 0.003 s</p>
                      </div>
                      
                      {/* t = 0.004s */}
                      <div className="text-center">
                        <svg width="100%" height="80" viewBox="0 0 60 80" className="bg-white rounded border">
                          {/* Ground */}
                          <rect x="0" y="70" width="60" height="10" fill="#8B5A2B"/>
                          {/* Ball - in air again */}
                          <circle cx="30" cy="20" r="8" fill="#FFD93D" stroke="#F39C12" strokeWidth="1"/>
                        </svg>
                        <p className="text-xs mt-1">t = 0.004 s</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="mb-4">
                    A force-time diagram showing the impulse acting on the ball will look something like the following:
                  </p>
                  
                  {/* Force-Time Graphs Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Golf ball force-time graph */}
                    <div className="bg-gray-50 p-4 rounded border">
                      <h6 className="font-semibold text-center mb-3">Force-Time Graph for Golf Ball</h6>
                      <svg width="100%" height="200" viewBox="0 0 300 200" className="border border-gray-300 bg-white rounded">
                        {/* Grid */}
                        <defs>
                          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="300" height="200" fill="url(#smallGrid)" />
                        
                        {/* Normal curve force line - realistic golf ball bounce */}
                        <path d="M 30 180 C 80 180, 120 40, 150 40 C 180 40, 220 180, 270 180" fill="none" stroke="#E74C3C" strokeWidth="3"/>
                        
                        {/* Shaded area under curve */}
                        <path d="M 30 180 C 80 180, 120 40, 150 40 C 180 40, 220 180, 270 180 L 270 180 L 30 180 Z" fill="rgba(231, 76, 60, 0.2)"/>
                        
                        {/* Axes */}
                        <line x1="30" y1="180" x2="280" y2="180" stroke="#333" strokeWidth="2"/>
                        <line x1="30" y1="180" x2="30" y2="20" stroke="#333" strokeWidth="2"/>
                        
                        {/* Labels */}
                        <text x="285" y="185" fontSize="12">t</text>
                        <text x="20" y="15" fontSize="12">F</text>
                        <text x="150" y="195" fontSize="10" textAnchor="middle">Time</text>
                        <text x="15" y="100" fontSize="10" textAnchor="middle" transform="rotate(-90 15 100)">Force</text>
                      </svg>
                    </div>
                    
                    {/* Constant force graph for comparison */}
                    <div className="bg-gray-50 p-4 rounded border">
                      <h6 className="font-semibold text-center mb-3">Force-Time for Constant Force<br/>(for comparison)</h6>
                      <svg width="100%" height="200" viewBox="0 0 300 200" className="border border-gray-300 bg-white rounded">
                        {/* Grid */}
                        <rect width="300" height="200" fill="url(#smallGrid)" />
                        
                        {/* Rectangular force profile */}
                        <polyline points="30,180 30,80 270,80 270,180" fill="none" stroke="#2980B9" strokeWidth="3"/>
                        
                        {/* Shaded area under rectangle */}
                        <rect x="30" y="80" width="240" height="100" fill="rgba(41, 128, 185, 0.2)"/>
                        
                        {/* Axes */}
                        <line x1="30" y1="180" x2="280" y2="180" stroke="#333" strokeWidth="2"/>
                        <line x1="30" y1="180" x2="30" y2="20" stroke="#333" strokeWidth="2"/>
                        
                        {/* Labels */}
                        <text x="285" y="185" fontSize="12">t</text>
                        <text x="20" y="15" fontSize="12">F</text>
                        <text x="150" y="195" fontSize="10" textAnchor="middle">Time</text>
                        <text x="15" y="100" fontSize="10" textAnchor="middle" transform="rotate(-90 15 100)">Force</text>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="font-semibold text-gray-800">
                    The impulse may be found by calculating the area under the force–time graph.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      ) : (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Analysis of Interactions Involving Impulse</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 italic">
              [Complete analysis and interactive elements available when AI features are enabled]
            </p>
          </div>
        </div>
      )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 3 - Force on a Ball as a Function of Time" 
            value="example-3-force-on-ball-function-of-time" 
            onAskAI={onAIAccordionContent}
          >
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
          </AIAccordion.Item>
        </AIAccordion>
      ) : (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Example 3 - Force on a Ball as a Function of Time</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 italic">
              [Complete problem solution and interactive elements available when AI features are enabled]
            </p>
          </div>
        </div>
      )}

      <TextSection>
        <SlideshowKnowledgeCheck
          courseId="2"
          lessonPath="04-impulse-momentum-change-advanced"
          questions={[
            {
              type: 'multiple-choice',
              question: 'Child Hitting Ball',
              questionId: 'course2_04_child_ball'
            },
            {
              type: 'multiple-choice',
              question: 'Ball Struck by Bat',
              questionId: 'course2_04_ball_bat',
              points: 4
            },
            {
              type: 'multiple-choice',
              question: 'Bullet Through Wood',
              questionId: 'course2_04_bullet_wood',
              points: 4
            },
            {
              type: 'multiple-choice',
              question: 'Water Turbine Blade',
              questionId: 'course2_04_water_turbine',
              points: 4
            }
          ]}
          theme="blue"
        />
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