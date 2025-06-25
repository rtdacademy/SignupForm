import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson about Momentum in Two Dimensions
 * Covers vector momentum analysis, two-dimensional collisions, and conservation principles in 2D systems
 */
const MomentumTwoDimensions = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Collapsible section states
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const [isComponentMethodOpen, setIsComponentMethodOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isVectorAdditionOpen, setIsVectorAdditionOpen] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);  const [isExample4Open, setIsExample4Open] = useState(false);
  const [isExample5Open, setIsExample5Open] = useState(false);

  // Practice problem states
  const [currentTwoDProblem1, setCurrentTwoDProblem1] = useState(0);
  const [currentTwoDProblem2, setCurrentTwoDProblem2] = useState(0);

  // Two-dimensional momentum practice problems data set 1 (after Example 2)
  const twoDimensionalProblems1 = [
    {
      id: 1,
      question: "A 2.0 kg object traveling east at 8.0 m/s collides with a 3.0 kg object at rest. After collision, the 2.0 kg object moves at 30° north of east at 4.0 m/s. What is the velocity of the 3.0 kg object?",
      given: ["m₁ = 2.0 kg, v₁ᵢ = 8.0 m/s east", "m₂ = 3.0 kg, v₂ᵢ = 0 m/s", "v₁f = 4.0 m/s [30° N of E]"],
      equation: "\\vec{p}_{initial} = \\vec{p}_{final}",
      solution: "p_{1x,f} = (2.0)(4.0)\\cos(30°) = 6.93 \\text{ kg·m/s}, p_{1y,f} = (2.0)(4.0)\\sin(30°) = 4.0 \\text{ kg·m/s}, p_{2x,f} = 16.0 - 6.93 = 9.07 \\text{ kg·m/s}, p_{2y,f} = 0 - 4.0 = -4.0 \\text{ kg·m/s}",
      answer: "3.6 m/s [24° S of E]"
    },
    {
      id: 2,
      question: "A 5.0 kg bomb at rest explodes into two pieces. One piece (2.0 kg) moves north at 15 m/s. What is the velocity of the other piece?",
      given: ["Initial: m = 5.0 kg at rest", "Piece 1: m₁ = 2.0 kg, v₁ = 15 m/s north", "Piece 2: m₂ = 3.0 kg"],
      equation: "\\vec{p}_{before} = \\vec{p}_{after}",
      solution: "0 = (2.0)(15) + (3.0)v_2, v_2 = -\\frac{30}{3.0} = -10 \\text{ m/s}",
      answer: "10 m/s south"
    },
    {
      id: 3,
      question: "A 1500 kg car traveling east at 20 m/s collides with a 1000 kg car traveling north at 15 m/s. If they stick together, what is their final velocity?",
      given: ["Car 1: m₁ = 1500 kg, v₁ = 20 m/s east", "Car 2: m₂ = 1000 kg, v₂ = 15 m/s north", "Final: combined mass = 2500 kg"],
      equation: "\\vec{p}_{total,initial} = \\vec{p}_{total,final}",
      solution: "p_x = (1500)(20) = 30000 \\text{ kg·m/s}, p_y = (1000)(15) = 15000 \\text{ kg·m/s}, |v_f| = \\frac{\\sqrt{30000^2 + 15000^2}}{2500} = 13.4 \\text{ m/s}",
      answer: "13.4 m/s [26.6° N of E]"
    },
    {
      id: 4,
      question: "A 0.2 kg ball moving at 25 m/s [45° N of E] strikes a wall and bounces off at 20 m/s [45° N of W]. What is the change in momentum?",
      given: ["m = 0.2 kg", "vᵢ = 25 m/s [45° N of E]", "vf = 20 m/s [45° N of W]"],
      equation: "\\Delta \\vec{p} = m(\\vec{v}_f - \\vec{v}_i)",
      solution: "p_{ix} = (0.2)(25)\\cos(45°) = 3.54 \\text{ kg·m/s}, p_{fx} = -(0.2)(20)\\cos(45°) = -2.83 \\text{ kg·m/s}, \\Delta p_x = -2.83 - 3.54 = -6.37 \\text{ kg·m/s}",
      answer: "6.37 kg·m/s west"
    }
  ];
  // Two-dimensional momentum practice problems data set 2 (after Example 5)
  const twoDimensionalProblems2 = [
    {
      id: 1,
      question: "A 15 kg object at rest explodes into three pieces. Piece A (4.0 kg) moves east at 12 m/s, piece B (6.0 kg) moves 30° north of west at 8.0 m/s. Find the velocity of piece C (5.0 kg).",
      given: ["m_A = 4.0\\text{ kg}, v_A = 12\\text{ m/s east}", "m_B = 6.0\\text{ kg}, v_B = 8.0\\text{ m/s [30° N of W]}", "m_C = 5.0\\text{ kg}, v_C = ?"],
      equation: "\\vec{p}_{initial} = \\vec{p}_A + \\vec{p}_B + \\vec{p}_C",
      solution: [
        { step: "Find components of piece A", math: "p_{Ax} = (4.0)(12) = 48\\text{ kg⋅m/s}, p_{Ay} = 0" },
        { step: "Find components of piece B", math: "p_{Bx} = (6.0)(8.0)\\cos(150°) = -41.6\\text{ kg⋅m/s}, p_{By} = (6.0)(8.0)\\sin(150°) = 24\\text{ kg⋅m/s}" },
        { step: "Apply conservation", math: "0 = 48 + (-41.6) + p_{Cx} \\Rightarrow p_{Cx} = -6.4\\text{ kg⋅m/s}" },
        { step: "Apply conservation (y)", math: "0 = 0 + 24 + p_{Cy} \\Rightarrow p_{Cy} = -24\\text{ kg⋅m/s}" },
        { step: "Find magnitude and direction", math: "|v_C| = \\frac{\\sqrt{6.4^2 + 24^2}}{5.0} = 5.0\\text{ m/s}, \\theta = \\tan^{-1}(24/6.4) = 75°\\text{ S of W}" }
      ],
      answer: "5.0\\text{ m/s [75° S of W]}"
    },
    {
      id: 2,
      question: "Two hockey pucks collide. Puck 1 (0.16 kg) moves east at 5.0 m/s and puck 2 (0.12 kg) moves north at 4.0 m/s. After collision, puck 1 moves at 3.0 m/s [30° S of E]. What is puck 2's final velocity?",
      given: ["m_1 = 0.16\\text{ kg}, v_{1i} = 5.0\\text{ m/s east}", "m_2 = 0.12\\text{ kg}, v_{2i} = 4.0\\text{ m/s north}", "v_{1f} = 3.0\\text{ m/s [30° S of E]}"],
      equation: "\\vec{p}_{before} = \\vec{p}_{after}",
      solution: [
        { step: "Initial momentum", math: "p_{x,i} = (0.16)(5.0) = 0.8\\text{ kg⋅m/s}, p_{y,i} = (0.12)(4.0) = 0.48\\text{ kg⋅m/s}" },
        { step: "Final puck 1 momentum", math: "p_{1x,f} = (0.16)(3.0)\\cos(-30°) = 0.416\\text{ kg⋅m/s}, p_{1y,f} = (0.16)(3.0)\\sin(-30°) = -0.24\\text{ kg⋅m/s}" },
        { step: "Conservation (x)", math: "0.8 = 0.416 + p_{2x,f} \\Rightarrow p_{2x,f} = 0.384\\text{ kg⋅m/s}" },
        { step: "Conservation (y)", math: "0.48 = -0.24 + p_{2y,f} \\Rightarrow p_{2y,f} = 0.72\\text{ kg⋅m/s}" },
        { step: "Final velocity", math: "|v_{2f}| = \\frac{\\sqrt{0.384^2 + 0.72^2}}{0.12} = 6.7\\text{ m/s}, \\theta = \\tan^{-1}(0.72/0.384) = 62°\\text{ N of E}" }
      ],
      answer: "6.7\\text{ m/s [62° N of E]}"
    },
    {
      id: 3,
      question: "A 20 kg cannonball is fired from a 500 kg cannon. The cannonball moves at 100 m/s [45° above horizontal]. What is the recoil velocity of the cannon?",
      given: ["m_{ball} = 20\\text{ kg}, v_{ball} = 100\\text{ m/s [45° above horizontal]}", "m_{cannon} = 500\\text{ kg}", "\\text{Initial: both at rest}"],
      equation: "\\vec{p}_{initial} = \\vec{p}_{final}",
      solution: [
        { step: "Ball momentum components", math: "p_{ball,x} = (20)(100)\\cos(45°) = 1414\\text{ kg⋅m/s}, p_{ball,y} = 1414\\text{ kg⋅m/s}" },
        { step: "Conservation (x)", math: "0 = 1414 + p_{cannon,x} \\Rightarrow p_{cannon,x} = -1414\\text{ kg⋅m/s}" },
        { step: "Conservation (y)", math: "0 = 1414 + p_{cannon,y} \\Rightarrow p_{cannon,y} = -1414\\text{ kg⋅m/s}" },
        { step: "Cannon velocity", math: "|v_{cannon}| = \\frac{\\sqrt{1414^2 + 1414^2}}{500} = 4.0\\text{ m/s}" },
        { step: "Direction", math: "\\theta = \\tan^{-1}(1414/1414) = 45°\\text{ below horizontal backward}" }
      ],
      answer: "4.0\\text{ m/s [45° below horizontal backward]}"
    },
    {
      id: 4,
      question: "A neutron (mass 1.67 × 10⁻²⁷ kg) moving at 2.0 × 10⁶ m/s east collides with a stationary nucleus (mass 5.01 × 10⁻²⁷ kg). After collision, the neutron moves at 1.2 × 10⁶ m/s [60° N of E]. Find the nucleus velocity.",
      given: ["m_n = 1.67 × 10^{-27}\\text{ kg}, v_{ni} = 2.0 × 10^6\\text{ m/s east}", "m_{nucleus} = 5.01 × 10^{-27}\\text{ kg}, v_{nucleus,i} = 0", "v_{nf} = 1.2 × 10^6\\text{ m/s [60° N of E]}"],
      equation: "\\vec{p}_{conservation}",
      solution: [
        { step: "Initial momentum", math: "p_{x,i} = (1.67 × 10^{-27})(2.0 × 10^6) = 3.34 × 10^{-21}\\text{ kg⋅m/s}" },
        { step: "Final neutron momentum", math: "p_{nx,f} = (1.67 × 10^{-27})(1.2 × 10^6)\\cos(60°) = 1.00 × 10^{-21}\\text{ kg⋅m/s}, p_{ny,f} = 1.73 × 10^{-21}\\text{ kg⋅m/s}" },
        { step: "Conservation (x)", math: "3.34 × 10^{-21} = 1.00 × 10^{-21} + p_{nucleus,x} \\Rightarrow p_{nucleus,x} = 2.34 × 10^{-21}\\text{ kg⋅m/s}" },
        { step: "Conservation (y)", math: "0 = 1.73 × 10^{-21} + p_{nucleus,y} \\Rightarrow p_{nucleus,y} = -1.73 × 10^{-21}\\text{ kg⋅m/s}" },
        { step: "Nucleus velocity", math: "|v_{nucleus}| = \\frac{\\sqrt{(2.34)^2 + (1.73)^2} × 10^{-21}}{5.01 × 10^{-27}} = 5.8 × 10^5\\text{ m/s}, \\theta = 36°\\text{ S of E}" }
      ],
      answer: "5.8 × 10^5\\text{ m/s [36° S of E]}"
    }
  ];

  // Navigation functions for practice problems
  const nextTwoDProblem1 = () => {
    setCurrentTwoDProblem1((prev) => (prev + 1) % twoDimensionalProblems1.length);
  };

  const prevTwoDProblem1 = () => {
    setCurrentTwoDProblem1((prev) => (prev - 1 + twoDimensionalProblems1.length) % twoDimensionalProblems1.length);
  };

  const goToTwoDProblem1 = (index) => {
    setCurrentTwoDProblem1(index);
  };

  const nextTwoDProblem2 = () => {
    setCurrentTwoDProblem2((prev) => (prev + 1) % twoDimensionalProblems2.length);
  };

  const prevTwoDProblem2 = () => {
    setCurrentTwoDProblem2((prev) => (prev - 1 + twoDimensionalProblems2.length) % twoDimensionalProblems2.length);
  };

  const goToTwoDProblem2 = (index) => {
    setCurrentTwoDProblem2(index);
  };

  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    'default';

  // Debug logging
  useEffect(() => {
    console.log("🔥 Rendering MomentumTwoDimensions component with:", {
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

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <LessonContent
      lessonId="lesson_1747281779014_814"
      title="Lesson 2 - Momentum in Two Dimensions"
      metadata={{ estimated_time: '120 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsIntroductionOpen(!isIntroductionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Introduction to Two-Dimensional Momentum</h3>
            <span className="text-blue-600">{isIntroductionOpen ? '▼' : '▶'}</span>
          </button>

          {isIntroductionOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  When we extend our study of momentum to two or more dimensions, we must remember that 
                  momentum has two major properties that remain fundamental to our understanding:
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Two Major Properties of Momentum:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-blue-900">Momentum is always conserved</p>
                        <p className="text-blue-800 text-sm">
                          In isolated systems, the total momentum before any interaction equals the total momentum after the interaction.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-blue-900">Momentum is a vector quantity</p>
                        <p className="text-blue-800 text-sm">
                          Momentum has both magnitude and direction, making vector analysis essential for multi-dimensional problems.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3">Vector Addition in Two Dimensions</h4>
                  <p className="mb-3 text-green-900">
                    When extending momentum analysis to two or more dimensions, we must use vector addition. 
                    There are two basic techniques for handling vector momentum:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">1. Component Method</h5>
                      <p className="text-sm text-green-800">
                        Break each momentum vector into its x and y components, then apply conservation 
                        of momentum separately to each direction. This method is particularly useful when 
                        dealing with collisions at various angles.
                      </p>
                      <div className="mt-2 text-center">
                        <InlineMath>{'\\vec{p} = p_x\\hat{i} + p_y\\hat{j}'}</InlineMath>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">2. Vector Addition Method</h5>
                      <p className="text-sm text-green-800">
                        Use geometric principles such as the parallelogram rule or triangle method to 
                        combine momentum vectors directly. This method provides visual insight into 
                        the momentum relationships.
                      </p>
                      <div className="mt-2 text-center">
                        <InlineMath>{'\\vec{p}_{total} = \\vec{p}_1 + \\vec{p}_2 + \\vec{p}_3 + ...'}</InlineMath>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Key Insight:</h4>
                  <p className="text-yellow-900">
                    The conservation of momentum principle applies independently to each dimension. 
                    This means that momentum is conserved in the x-direction and simultaneously 
                    conserved in the y-direction, allowing us to solve complex two-dimensional 
                    collision problems systematically.
                  </p>
                </div>
              </div>
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsComponentMethodOpen(!isComponentMethodOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Component Method</h3>
            <span className="text-blue-600">{isComponentMethodOpen ? '▼' : '▶'}</span>
          </button>

          {isComponentMethodOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">                <p className="mb-4">
                  The main principle used in the component method for solving two dimensional collision 
                  problems is that the momentum in the east-west direction and the momentum in the 
                  north-south direction are independent – we treat east-west momentum separately from 
                  north-south momentum.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3">Independent Directions</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">East-West Direction (x-axis)</h5>
                      <p className="text-sm text-green-800">
                        Conservation of momentum applies independently in the horizontal direction:
                      </p>
                      <div className="mt-2 text-center">
                        <InlineMath>{'\\sum p_{x,initial} = \\sum p_{x,final}'}</InlineMath>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">North-South Direction (y-axis)</h5>
                      <p className="text-sm text-green-800">
                        Conservation of momentum applies independently in the vertical direction:
                      </p>
                      <div className="mt-2 text-center">
                        <InlineMath>{'\\sum p_{y,initial} = \\sum p_{y,final}'}</InlineMath>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>      </TextSection>

      <TextSection>
        <div className="mb-6">          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1 - Two-Dimensional Explosion</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>          {isExample1Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 16.0 kg object traveling east at 30.00 m/s explodes into two pieces. The first part has 
                  a mass of 10.0 kg and it travels away at 35.00 m/s [45° N of E]. The second part has a 
                  mass of 6.0 kg. What is the velocity of the 6.0 kg mass?
                </p>
                  <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>                  {/* Vector Diagrams */}                  <div className="mb-6 p-4 bg-gray-50 rounded border overflow-hidden">
                    <h5 className="font-semibold text-gray-800 mb-4 text-center">Vector Diagrams</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Before Explosion */}
                      <div className="text-center overflow-hidden">
                        <h6 className="font-medium text-gray-700 mb-3">Before Explosion</h6>
                        <div className="w-full max-w-xs mx-auto overflow-hidden">
                          <svg width="100%" height="120" viewBox="0 0 260 120" className="border border-gray-300 bg-white rounded max-w-full">
                            <defs>
                              <marker id="arrow1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                              </marker>
                            </defs>
                            
                            {/* Single object - purple circle */}
                            <circle cx="50" cy="60" r="18" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
                            <text x="50" y="66" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">16.0 kg</text>
                            
                            {/* Velocity vector */}
                            <line x1="68" y1="60" x2="170" y2="60" stroke="#000" strokeWidth="4" markerEnd="url(#arrow1)"/>
                            <text x="119" y="50" fontSize="14" fill="#000" textAnchor="middle" fontWeight="bold">30.0 m/s</text>
                            <text x="119" y="80" fontSize="12" fill="#666" textAnchor="middle">East</text>
                          </svg>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <p><strong>Total momentum:</strong> 480.0 kg⋅m/s east</p>
                        </div>
                      </div>
                      
                      {/* After Explosion */}
                      <div className="text-center overflow-hidden">
                        <h6 className="font-medium text-gray-700 mb-3">After Explosion</h6>
                        <div className="w-full max-w-xs mx-auto overflow-hidden">
                          <svg width="100%" height="120" viewBox="0 0 260 120" className="border border-gray-300 bg-white rounded max-w-full">
                            <defs>
                              <marker id="arrow2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                              </marker>
                              <marker id="arrow3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#999"/>
                              </marker>
                            </defs>
                            
                            {/* First piece (10.0 kg) - red circle */}
                            <circle cx="45" cy="35" r="15" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <text x="45" y="40" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">10.0</text>
                            
                            {/* First piece velocity (45° northeast) */}
                            <line x1="60" y1="35" x2="115" y2="15" stroke="#000" strokeWidth="3" markerEnd="url(#arrow2)"/>
                            <text x="90" y="10" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">35.0 m/s</text>
                            <text x="90" y="55" fontSize="11" fill="#666" textAnchor="middle">45° N of E</text>
                            
                            {/* Second piece (6.0 kg) - blue circle */}
                            <circle cx="45" cy="85" r="12" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                            <text x="45" y="90" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">6.0</text>
                            
                            {/* Second piece velocity (unknown, dashed) */}
                            <line x1="57" y1="85" x2="115" y2="105" stroke="#999" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrow3)"/>
                            <text x="140" y="95" fontSize="12" fill="#999" textAnchor="middle" fontWeight="bold">v₂ = ?</text>
                          </svg>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <p><strong>Must conserve momentum</strong></p>
                          <p>Find velocity of 6.0 kg piece</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Calculate total momentum before explosion:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-3">Since the object is moving only in the east direction initially:</p>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-medium mb-2">x-direction (East-West):</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{x,initial} = mv'}</InlineMath></div>
                              <div><InlineMath>{'p_{x,initial} = (16.0\\text{ kg})(30.00\\text{ m/s})'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{x,initial} = 480.0\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-direction (North-South):</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{y,initial} = 0\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                              <div className="text-sm text-gray-600">(no motion in vertical direction)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                      <li>
                      <strong>Calculate momentum components for the 10.0 kg piece after explosion:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-3">For the piece traveling at 35.00 m/s [45° N of E]:</p>
                          {/* Component Triangle for 10.0 kg piece */}
                        <div className="mb-4 p-4 bg-blue-50 rounded border">
                          <h6 className="font-medium text-blue-800 mb-3 text-center">Momentum Components - 10.0 kg piece</h6>
                          <div className="w-full max-w-sm mx-auto">
                            <svg width="100%" height="180" viewBox="0 0 240 180" className="border border-blue-300 bg-white rounded">
                              <defs>
                                <marker id="arrowComp1" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#dc2626"/>
                                </marker>
                                <marker id="arrowCompX1" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#059669"/>
                                </marker>
                                <marker id="arrowCompY1" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#7c3aed"/>
                                </marker>
                              </defs>
                              
                              {/* Origin point */}
                              <circle cx="40" cy="140" r="3" fill="#000"/>
                              
                              {/* Main vector (resultant) */}
                              <line x1="40" y1="140" x2="140" y2="70" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowComp1)"/>
                              <text x="70" y="90" fontSize="12" fill="#dc2626" textAnchor="middle" fontWeight="bold">350 kg⋅m/s</text>
                              
                              {/* x-component (horizontal) */}
                              <line x1="40" y1="140" x2="140" y2="140" stroke="#059669" strokeWidth="2" markerEnd="url(#arrowCompX1)"/>
                              <text x="90" y="155" fontSize="11" fill="#059669" textAnchor="middle" fontWeight="bold">247.5 kg⋅m/s</text>
                              <text x="90" y="168" fontSize="9" fill="#059669" textAnchor="middle">(x-component)</text>
                              
                              {/* y-component (vertical) */}
                              <line x1="140" y1="140" x2="140" y2="70" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowCompY1)"/>
                              <text x="165" y="105" fontSize="11" fill="#7c3aed" textAnchor="middle" fontWeight="bold">247.5</text>
                              <text x="165" y="118" fontSize="9" fill="#7c3aed" textAnchor="middle">kg⋅m/s</text>
                              <text x="165" y="130" fontSize="9" fill="#7c3aed" textAnchor="middle">(y-comp)</text>
                              
                              {/* Right angle indicator */}
                              <path d="M 130 140 L 130 130 L 140 130" stroke="#666" strokeWidth="1" fill="none"/>
                              
                              {/* Angle arc */}
                              <path d="M 60 140 A 20 20 0 0 0 54.14 125.86" stroke="#000" strokeWidth="1" fill="none"/>
                              <text x="65" y="132" fontSize="9" fill="#000">45°</text>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-2">x-component:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{1x} = m_1v_1\\cos(45°)'}</InlineMath></div>
                              <div><InlineMath>{'p_{1x} = (10.0)(35.00)(0.707)'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{1x} = 247.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-component:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{1y} = m_1v_1\\sin(45°)'}</InlineMath></div>
                              <div><InlineMath>{'p_{1y} = (10.0)(35.00)(0.707)'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{1y} = 247.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply conservation of momentum to find momentum of 6.0 kg piece:</strong>
                      <div className="pl-4 mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-2">x-direction:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{x,initial} = p_{1x} + p_{2x}'}</InlineMath></div>
                              <div><InlineMath>{'480.0 = 247.5 + p_{2x}'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{2x} = 232.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-direction:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{y,initial} = p_{1y} + p_{2y}'}</InlineMath></div>
                              <div><InlineMath>{'0 = 247.5 + p_{2y}'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{2y} = -247.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                      <li>
                      <strong>Calculate velocity magnitude and direction of 6.0 kg mass:</strong>
                      <div className="pl-4 mt-2">
                          {/* Component Triangle for 6.0 kg piece */}
                        <div className="mb-4 p-4 bg-orange-50 rounded border">
                          <h6 className="font-medium text-orange-800 mb-3 text-center">Momentum Components - 6.0 kg piece</h6>
                          <div className="w-full max-w-sm mx-auto">
                            <svg width="100%" height="180" viewBox="0 0 240 180" className="border border-orange-300 bg-white rounded">
                              <defs>
                                <marker id="arrowComp2" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#2563eb"/>
                                </marker>
                                <marker id="arrowCompX2" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#059669"/>
                                </marker>
                                <marker id="arrowCompY2" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#7c3aed"/>
                                </marker>
                              </defs>
                              
                              {/* Origin point */}
                              <circle cx="40" cy="70" r="3" fill="#000"/>                              {/* Main vector (resultant) - pointing southeast */}
                              <line x1="40" y1="70" x2="140" y2="140" stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrowComp2)"/>
                              <text x="60" y="160" fontSize="12" fill="#2563eb" textAnchor="middle" fontWeight="bold">339.5 kg⋅m/s</text>
                              
                              {/* x-component (horizontal, positive direction) */}
                              <line x1="40" y1="70" x2="140" y2="70" stroke="#059669" strokeWidth="2" markerEnd="url(#arrowCompX2)"/>
                              <text x="90" y="60" fontSize="11" fill="#059669" textAnchor="middle" fontWeight="bold">232.5 kg⋅m/s</text>
                              <text x="90" y="48" fontSize="9" fill="#059669" textAnchor="middle">(x-component)</text>
                              
                              {/* y-component (vertical, downward) */}
                              <line x1="140" y1="70" x2="140" y2="140" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowCompY2)"/>
                              <text x="165" y="105" fontSize="11" fill="#7c3aed" textAnchor="middle" fontWeight="bold">247.5</text>
                              <text x="165" y="118" fontSize="9" fill="#7c3aed" textAnchor="middle">kg⋅m/s</text>
                              <text x="165" y="130" fontSize="9" fill="#7c3aed" textAnchor="middle">(downward)</text>
                              
                              {/* Right angle indicator */}
                              <path d="M 130 70 L 130 80 L 140 80" stroke="#666" strokeWidth="1" fill="none"/>
                              
                              {/* Angle arc */}
                              <path d="M 60 70 A 20 20 0 0 1 54.14 84.14" stroke="#000" strokeWidth="1" fill="none"/>
                              <text x="65" y="85" fontSize="9" fill="#000">46.8°</text>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Momentum magnitude:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'|\\vec{p}_2| = \\sqrt{p_{2x}^2 + p_{2y}^2}'}</InlineMath></div>
                              <div><InlineMath>{'|\\vec{p}_2| = \\sqrt{(232.5)^2 + (-247.5)^2}'}</InlineMath></div>
                              <div><InlineMath>{'|\\vec{p}_2| = \\sqrt{54056.25 + 61256.25} = 339.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">Velocity magnitude:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'v_2 = \\frac{|\\vec{p}_2|}{m_2} = \\frac{339.5}{6.0} = 56.6\\text{ m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">Direction:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'\\theta = \\tan^{-1}\\left(\\frac{|p_{2y}|}{p_{2x}}\\right) = \\tan^{-1}\\left(\\frac{247.5}{232.5}\\right)'}</InlineMath></div>
                              <div><InlineMath>{'\\theta = \\tan^{-1}(1.065) = 46.8°'}</InlineMath></div>
                              <div className="text-sm text-gray-600">Since p₂y is negative, direction is south of east</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-2">
                        <p>
                          The velocity of the 6.0 kg mass is <InlineMath>{'\\vec{v}_2 = 56.6\\text{ m/s [46.8° S of E]}'}</InlineMath>.
                        </p>
                      </div>
                    </li>
                  </ol>
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
            <h3 className="text-xl font-semibold">Example 2 - Two-Dimensional Collision</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 100.0 kg object traveling east at 50.0 m/s collides with a 50.0 kg object at rest. 
                  If the 50.0 kg object travels away after the collision at 40.0 m/s at 30° N of E, 
                  what is the velocity of the 100.0 kg object after the collision?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>

                  {/* Vector Diagrams */}
                  <div className="mb-6 p-4 bg-gray-50 rounded border overflow-hidden">
                    <h5 className="font-semibold text-gray-800 mb-4 text-center">Vector Diagrams</h5>
                    <div className="grid md:grid-cols-2 gap-4">                      {/* Before Collision */}
                      <div className="text-center overflow-hidden">
                        <h6 className="font-medium text-gray-700 mb-3">Before Collision</h6>
                        <div className="w-full max-w-xs mx-auto overflow-hidden">
                          <svg width="100%" height="120" viewBox="0 0 280 120" className="border border-gray-300 bg-white rounded max-w-full">
                            <defs>
                              <marker id="arrow1b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                              </marker>
                            </defs>
                            
                            {/* Moving object - blue circle (larger) */}
                            <circle cx="50" cy="60" r="22" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                            <text x="50" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">100.0 kg</text>
                            
                            {/* Velocity vector for moving object */}
                            <line x1="72" y1="60" x2="170" y2="60" stroke="#000" strokeWidth="4" markerEnd="url(#arrow1b)"/>
                            <text x="121" y="50" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">50.0 m/s</text>
                            <text x="121" y="75" fontSize="11" fill="#666" textAnchor="middle">East</text>
                            
                            {/* Stationary object - red circle (larger, moved to right of vector) */}
                            <circle cx="200" cy="60" r="18" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <text x="200" y="65" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">50.0 kg</text>
                            <text x="240" y="65" fontSize="11" fill="#666" textAnchor="middle">At rest</text>
                          </svg>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <p><strong>Total momentum:</strong> 5000.0 kg⋅m/s east</p>
                        </div>
                      </div>
                        {/* After Collision */}
                      <div className="text-center overflow-hidden">
                        <h6 className="font-medium text-gray-700 mb-3">After Collision</h6>
                        <div className="w-full max-w-xs mx-auto overflow-hidden">
                          <svg width="100%" height="120" viewBox="0 0 280 120" className="border border-gray-300 bg-white rounded max-w-full">
                            <defs>
                              <marker id="arrow2b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#000"/>
                              </marker>
                              <marker id="arrow3b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#999"/>
                              </marker>
                            </defs>
                            
                            {/* 100.0 kg object after collision - blue circle (larger) */}
                            <circle cx="45" cy="75" r="22" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                            <text x="45" y="80" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">100.0 kg</text>
                            
                            {/* Unknown velocity vector (dashed) */}
                            <line x1="67" y1="75" x2="130" y2="95" stroke="#999" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrow3b)"/>
                            <text x="155" y="85" fontSize="12" fill="#999" textAnchor="middle" fontWeight="bold">v₁ = ?</text>
                            
                            {/* 50.0 kg object after collision - red circle (larger) */}
                            <circle cx="45" cy="35" r="18" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <text x="45" y="40" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">50.0 kg</text>
                            
                            {/* Known velocity vector (30° N of E) */}
                            <line x1="63" y1="35" x2="125" y2="15" stroke="#000" strokeWidth="3" markerEnd="url(#arrow2b)"/>
                            <text x="95" y="10" fontSize="11" fill="#000" textAnchor="middle" fontWeight="bold">40.0 m/s</text>
                            <text x="95" y="55" fontSize="10" fill="#666" textAnchor="middle">30° N of E</text>
                          </svg>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          <p><strong>Must conserve momentum</strong></p>
                          <p>Find velocity of 100.0 kg object</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Calculate total momentum before collision:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-3">The 100.0 kg object is moving east, the 50.0 kg object is at rest:</p>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-medium mb-2">x-direction (East-West):</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{x,initial} = m_1v_1 + m_2v_2'}</InlineMath></div>
                              <div><InlineMath>{'p_{x,initial} = (100.0)(50.0) + (50.0)(0)'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{x,initial} = 5000.0\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-direction (North-South):</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{y,initial} = 0\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                              <div className="text-sm text-gray-600">(no vertical motion initially)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li>
                      <strong>Calculate momentum components for the 50.0 kg object after collision:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-3">For the 50.0 kg object traveling at 40.0 m/s [30° N of E]:</p>
                        
                        {/* Component Triangle for 50.0 kg object */}
                        <div className="mb-4 p-4 bg-red-50 rounded border">
                          <h6 className="font-medium text-red-800 mb-3 text-center">Momentum Components - 50.0 kg object</h6>
                          <div className="w-full max-w-sm mx-auto">
                            <svg width="100%" height="180" viewBox="0 0 240 180" className="border border-red-300 bg-white rounded">                              <defs>
                                <marker id="arrowComp1b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#dc2626"/>
                                </marker>
                                <marker id="arrowCompX1b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#059669"/>
                                </marker>
                                <marker id="arrowCompY1b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#7c3aed"/>
                                </marker>
                              </defs>
                              
                              {/* Origin point */}
                              <circle cx="40" cy="140" r="3" fill="#000"/>
                              
                              {/* Main vector (resultant) */}
                              <line x1="40" y1="140" x2="130" y2="80" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowComp1b)"/>
                              <text x="70" y="95" fontSize="12" fill="#dc2626" textAnchor="middle" fontWeight="bold">2000 kg⋅m/s</text>
                              
                              {/* x-component (horizontal) */}
                              <line x1="40" y1="140" x2="130" y2="140" stroke="#059669" strokeWidth="2" markerEnd="url(#arrowCompX1b)"/>
                              <text x="85" y="155" fontSize="11" fill="#059669" textAnchor="middle" fontWeight="bold">1732 kg⋅m/s</text>
                              <text x="85" y="168" fontSize="9" fill="#059669" textAnchor="middle">(x-component)</text>
                              
                              {/* y-component (vertical) */}
                              <line x1="130" y1="140" x2="130" y2="80" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowCompY1b)"/>
                              <text x="155" y="110" fontSize="11" fill="#7c3aed" textAnchor="middle" fontWeight="bold">1000</text>
                              <text x="155" y="123" fontSize="9" fill="#7c3aed" textAnchor="middle">kg⋅m/s</text>
                              <text x="155" y="135" fontSize="9" fill="#7c3aed" textAnchor="middle">(y-comp)</text>
                              
                              {/* Right angle indicator */}
                              <path d="M 120 140 L 120 130 L 130 130" stroke="#666" strokeWidth="1" fill="none"/>
                              
                              {/* Angle arc */}
                              <path d="M 60 140 A 20 20 0 0 0 57.32 123.21" stroke="#000" strokeWidth="1" fill="none"/>
                              <text x="65" y="132" fontSize="9" fill="#000">30°</text>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-2">x-component:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{2x} = m_2v_2\\cos(30°)'}</InlineMath></div>
                              <div><InlineMath>{'p_{2x} = (50.0)(40.0)(0.866)'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{2x} = 1732\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-component:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{2y} = m_2v_2\\sin(30°)'}</InlineMath></div>
                              <div><InlineMath>{'p_{2y} = (50.0)(40.0)(0.500)'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{2y} = 1000\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply conservation of momentum to find momentum of 100.0 kg object:</strong>
                      <div className="pl-4 mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-2">x-direction:</p>                            <div className="space-y-1">
                              <div><InlineMath>{'p_{x,initial} = p_{1x} + p_{2x}'}</InlineMath></div>
                              <div><InlineMath>{'5000.0 = p_{1x} + 1732'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{1x} = 3270\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">y-direction:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'p_{y,initial} = p_{1y} + p_{2y}'}</InlineMath></div>
                              <div><InlineMath>{'0 = p_{1y} + 1000'}</InlineMath></div>
                              <div className="font-semibold"><InlineMath>{'p_{1y} = -1000\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li>
                      <strong>Calculate velocity magnitude and direction of 100.0 kg object:</strong>
                      <div className="pl-4 mt-2">
                          {/* Component Triangle for 100.0 kg object */}
                        <div className="mb-4 p-4 bg-blue-50 rounded border">
                          <h6 className="font-medium text-blue-800 mb-3 text-center">Momentum Components - 100.0 kg object</h6>
                          <div className="w-full max-w-sm mx-auto">
                            <svg width="100%" height="180" viewBox="0 0 240 180" className="border border-blue-300 bg-white rounded">
                              <defs>
                                <marker id="arrowComp2b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#2563eb"/>
                                </marker>
                                <marker id="arrowCompX2b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#059669"/>
                                </marker>
                                <marker id="arrowCompY2b" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                  <polygon points="0 0, 6 2.5, 0 5" fill="#7c3aed"/>
                                </marker>
                              </defs>
                              
                              {/* Origin point */}
                              <circle cx="40" cy="70" r="3" fill="#000"/>
                              
                              {/* Main vector (resultant) - pointing southeast */}
                              <line x1="40" y1="70" x2="140" y2="125" stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrowComp2b)"/>
                              <text x="65" y="155" fontSize="12" fill="#2563eb" textAnchor="middle" fontWeight="bold">3420 kg⋅m/s</text>
                              
                              {/* x-component (horizontal, positive direction) */}
                              <line x1="40" y1="70" x2="140" y2="70" stroke="#059669" strokeWidth="2" markerEnd="url(#arrowCompX2b)"/>
                              <text x="90" y="60" fontSize="11" fill="#059669" textAnchor="middle" fontWeight="bold">3270 kg⋅m/s</text>
                              <text x="90" y="48" fontSize="9" fill="#059669" textAnchor="middle">(x-component)</text>
                              
                              {/* y-component (vertical, downward) */}
                              <line x1="140" y1="70" x2="140" y2="125" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowCompY2b)"/>
                              <text x="165" y="97" fontSize="11" fill="#7c3aed" textAnchor="middle" fontWeight="bold">1000</text>
                              <text x="165" y="110" fontSize="9" fill="#7c3aed" textAnchor="middle">kg⋅m/s</text>
                              <text x="165" y="122" fontSize="9" fill="#7c3aed" textAnchor="middle">(downward)</text>
                              
                              {/* Right angle indicator */}
                              <path d="M 130 70 L 130 80 L 140 80" stroke="#666" strokeWidth="1" fill="none"/>
                              
                              {/* Angle arc */}
                              <path d="M 60 70 A 20 20 0 0 1 56.90 80.00" stroke="#000" strokeWidth="1" fill="none"/>
                              <text x="65" y="82" fontSize="9" fill="#000">17.0°</text>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="space-y-4">                          <div>
                            <p className="font-medium mb-2">Momentum magnitude:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'|\\vec{p}_1| = \\sqrt{p_{1x}^2 + p_{1y}^2}'}</InlineMath></div>
                              <div><InlineMath>{'|\\vec{p}_1| = \\sqrt{(3270)^2 + (-1000)^2}'}</InlineMath></div>
                              <div><InlineMath>{'|\\vec{p}_1| = \\sqrt{10692900 + 1000000} = 3420\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">Velocity magnitude:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'v_1 = \\frac{|\\vec{p}_1|}{m_1} = \\frac{3420}{100.0} = 34.2\\text{ m/s}'}</InlineMath></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">Direction:</p>
                            <div className="space-y-1">
                              <div><InlineMath>{'\\theta = \\tan^{-1}\\left(\\frac{|p_{1y}|}{p_{1x}}\\right) = \\tan^{-1}\\left(\\frac{1000}{3270}\\right)'}</InlineMath></div>
                              <div><InlineMath>{'\\theta = \\tan^{-1}(0.306) = 17.0°'}</InlineMath></div>
                              <div className="text-sm text-gray-600">Since p₁y is negative, direction is south of east</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-2">
                        <p>
                          The velocity of the 100.0 kg object is <InlineMath>{'\\vec{v}_1 = 34.2\\text{ m/s [17.0° S of E]}'}</InlineMath>.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <SlideshowKnowledgeCheck
          courseId="2"
          lessonPath="03-momentum-two-dimensions"
          questions={[
            {
              type: 'multiple-choice',
              question: 'Car-Truck 2D Collision',
              questionId: 'course2_03_car_truck_2d_collision',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Nuclear Decay Analysis',
              questionId: 'course2_03_nuclear_decay_2d',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Glancing Collision',
              questionId: 'course2_03_glancing_collision_2d',
              points: 3
            },
            {
              type: 'multiple-choice',
              question: 'Space Capsule Projectile',
              questionId: 'course2_03_space_capsule_projectile',
              points: 3
            }
          ]}
          theme="blue"
        />
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsVectorAdditionOpen(!isVectorAdditionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Vector Addition Method</h3>
            <span className="text-blue-600">{isVectorAdditionOpen ? '▼' : '▶'}</span>
          </button>

          {isVectorAdditionOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  The vector addition method uses geometric principles to combine momentum vectors directly. 
                  This approach provides visual insight into momentum relationships and is particularly 
                  useful when dealing with simple collision geometries.
                </p>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Geometric Laws</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <h5 className="font-semibold text-purple-700 mb-2">Cosine Law</h5>
                      <p className="text-sm text-purple-800 mb-2">
                        Used to find the magnitude of the resultant vector when two vectors and the angle between them are known.
                      </p>
                      <div className="text-center">
                        <BlockMath>{'c^2 = a^2 + b^2 - 2ab \\cos C'}</BlockMath>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <h5 className="font-semibold text-purple-700 mb-2">Sine Law</h5>
                      <p className="text-sm text-purple-800 mb-2">
                        Used to find unknown angles or sides in a triangle when some angles and sides are known.
                      </p>
                      <div className="text-center">
                        <BlockMath>{'\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}'}</BlockMath>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">When to Use Vector Addition Method</h4>
                  <ul className="list-disc list-inside space-y-2 text-yellow-900">
                    <li>When the collision geometry forms simple triangles</li>
                    <li>When you need to visualize the momentum relationships</li>
                    <li>When dealing with head-on or glancing collisions at specific angles</li>
                    <li>As a check for component method solutions</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Application Steps</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-900">
                    <li>Draw the momentum vectors to scale</li>
                    <li>Form a closed triangle using the momentum vectors</li>
                    <li>Identify known sides and angles in the triangle</li>
                    <li>Apply cosine law to find unknown magnitudes</li>
                    <li>Apply sine law to find unknown directions</li>
                    <li>Check that momentum is conserved in both magnitude and direction</li>
                  </ol>
                </div>
              </div>
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample3Open(!isExample3Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 3 - Two-Dimensional Explosion</h3>
            <span className="text-blue-600">{isExample3Open ? '▼' : '▶'}</span>
          </button>

          {isExample3Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 16.0 kg object traveling east at 30.00 m/s explodes into two pieces. The first part has 
                  a mass of 10.0 kg and it travels away at 35.00 m/s [45° N of E]. What is the velocity of 
                  the remaining 6.0 kg mass?
                </p>                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>

                  {/* Solution Steps */}
                  <ol className="space-y-4 text-sm">                    <li>
                      <strong>Calculate the known momentum vectors before and after the explosion:</strong>
                      <div className="pl-4 mt-2 space-y-2">
                        <p className="font-medium mb-2">Initial momentum (16.0 kg object):</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{16} = m_{16} \\cdot \\vec{v}_{16} = 16.0\\text{ kg} \\times 30.00\\text{ m/s [E]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{16} = 480.0\\text{ kg}\\cdot\\text{m/s [E]}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">10.0 kg piece momentum:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{10} = m_{10} \\cdot \\vec{v}_{10} = 10.0\\text{ kg} \\times 35.00\\text{ m/s [45° N of E]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{10} = 350.0\\text{ kg}\\cdot\\text{m/s [45° N of E]}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Apply conservation of momentum:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Momentum is conserved: <InlineMath>{'\\vec{p}_{initial} = \\vec{p}_{final}'}</InlineMath></p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{16} = \\vec{p}_{10} + \\vec{p}_{6}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{6} = \\vec{p}_{16} - \\vec{p}_{10}'}</InlineMath></div>
                        </div>
                        <p className="mt-2 text-sm ml-4">
                          The two vectors after the explosion add up to the before explosion vector.
                        </p>
                      </div>
                    </li>

                    {/* Vector Triangle Diagram */}
                    <li>
                      <strong>Vector triangle diagram:</strong>
                      <div className="pl-4 mt-2">
                        <div className="bg-gray-50 p-4 rounded border">
                          <div className="w-full max-w-md mx-auto">
                            <svg width="100%" height="200" viewBox="0 0 300 200" className="border border-gray-300 bg-white rounded">
                              <defs>
                                <marker id="arrow-p16" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                                  <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
                                </marker>
                                <marker id="arrow-p10" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                                  <polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
                                </marker>
                                <marker id="arrow-p6" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                                  <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                                </marker>
                              </defs>
                              
                              {/* Grid */}
                              <rect width="300" height="200" fill="url(#grid)" />                              {/* p16 vector (horizontal) */}
                              <line x1="50" y1="150" x2="200" y2="150" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrow-p16)"/>
                              <text x="125" y="170" textAnchor="middle" fontSize="12" fill="#8b5cf6" fontWeight="bold">p₁₆ = 480.0 kg·m/s</text>
                              
                              {/* p10 vector (45° up from origin) */}
                              <line x1="50" y1="150" x2="156" y2="44" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-p10)"/>
                              <text x="85" y="85" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold" transform="rotate(-45 85 85)">p₁₀ = 350.0 kg·m/s</text>
                              
                              {/* p6 vector (completing triangle) */}
                              <line x1="156" y1="44" x2="200" y2="150" stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrow-p6)"/>
                              <text x="190" y="95" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold" transform="rotate(75 190 95)">p₆ = ?</text>
                              
                              {/* Angle markers */}
                              <path d="M 50 150 A 20 20 0 0 0 64 136" fill="none" stroke="#dc2626" strokeWidth="1"/>
                              <text x="70" y="145" fontSize="10" fill="#dc2626">45°</text>
                              
                              {/* Internal angle at p16 end */}
                              <path d="M 200 150 A 15 15 0 0 1 185 135" fill="none" stroke="#2563eb" strokeWidth="1"/>
                              <text x="175" y="140" fontSize="10" fill="#2563eb">α</text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Calculate |p₆| and v₆ using the Cosine Law:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">We do not have a right triangle, so we use the Cosine Law:</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'c^2 = a^2 + b^2 - 2ab\\cos C'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_6|^2 = |\\vec{p}_{16}|^2 + |\\vec{p}_{10}|^2 - 2|\\vec{p}_{16}||\\vec{p}_{10}|\\cos(45°)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_6|^2 = (480)^2 + (350)^2 - 2(480)(350)\\cos(45°)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_6|^2 = 230400 + 122500 - 336000(0.707)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_6|^2 = 352900 - 237552 = 115348'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_6| = 339.5\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">Calculate velocity:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'v_6 = \\frac{|\\vec{p}_6|}{m_6} = \\frac{339.5\\text{ kg}\\cdot\\text{m/s}}{6.0\\text{ kg}} = 56.6\\text{ m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Find direction using the Sine Law:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">The direction angle α for p₆ outside the triangle:</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'\\frac{\\sin A}{a} = \\frac{\\sin C}{c}'}</InlineMath></div>
                          <div><InlineMath>{'\\frac{\\sin α}{350} = \\frac{\\sin(45°)}{339.5}'}</InlineMath></div>
                          <div><InlineMath>{'\\sin α = \\frac{350 \\times \\sin(45°)}{339.5} = \\frac{350 \\times 0.707}{339.5} = 0.728'}</InlineMath></div>
                          <div><InlineMath>{'α = \\sin^{-1}(0.728) = 46.8°'}</InlineMath></div>
                        </div>
                        <p className="mt-2 text-sm ml-4">
                          Since this is below the horizontal, the direction is 46.8° S of E.
                        </p>
                      </div>
                    </li>                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium">
                          The velocity of the 6.0 kg mass is <InlineMath>{'\\vec{v}_6 = 56.6\\text{ m/s [46.8° S of E]}'}</InlineMath>.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample4Open(!isExample4Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 4 - Two-Dimensional Collision with Unknown Final Velocity</h3>
            <span className="text-blue-600">{isExample4Open ? '▼' : '▶'}</span>
          </button>

          {isExample4Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 500 kg mass traveling south at 300 m/s collides with a 100 kg object at rest. 
                  If the 100 kg object ends up traveling at 400 m/s [30° E of S], what is the final 
                  velocity of the 500 kg object?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>

                  {/* Solution Steps */}
                  <ol className="space-y-4 text-sm">                    <li>
                      <strong>Calculate the known momentum vectors before and after the collision:</strong>
                      <div className="pl-4 mt-2 space-y-2">
                        <p className="font-medium mb-2">Initial momentum (500 kg object):</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{500} = m_{500} \\cdot \\vec{v}_{500} = 500\\text{ kg} \\times 300\\text{ m/s [S]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{500} = 150000\\text{ kg}\\cdot\\text{m/s [S]}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">100 kg object momentum after collision:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{100} = m_{100} \\cdot \\vec{v}_{100} = 100\\text{ kg} \\times 400\\text{ m/s [30° E of S]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{100} = 40000\\text{ kg}\\cdot\\text{m/s [30° E of S]}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Apply conservation of momentum:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Momentum is conserved: <InlineMath>{'\\vec{p}_{initial} = \\vec{p}_{final}'}</InlineMath></p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{500,initial} = \\vec{p}_{100,final} + \\vec{p}_{500,final}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{500,final} = \\vec{p}_{500,initial} - \\vec{p}_{100,final}'}</InlineMath></div>
                        </div>
                        <p className="mt-2 text-sm ml-4">
                          The final momentum of the 500 kg object can be found using vector subtraction.
                        </p>
                      </div>
                    </li>

                    {/* Vector Triangle Diagram */}
                    <li>
                      <strong>Vector triangle diagram:</strong>
                      <div className="pl-4 mt-2">
                        <div className="bg-gray-50 p-4 rounded border">
                          <div className="w-full max-w-md mx-auto">                            <svg width="100%" height="240" viewBox="0 0 350 240" className="border border-gray-300 bg-white rounded">
                              <defs>
                                <marker id="arrow-p500i" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#8b5cf6" />
                                </marker>
                                <marker id="arrow-p100f" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#dc2626" />
                                </marker>
                                <marker id="arrow-p500f" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#2563eb" />
                                </marker>
                              </defs>
                              
                              {/* p500 initial vector (pointing down - South) - scaled up */}
                              <line x1="175" y1="40" x2="175" y2="180" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrow-p500i)"/>
                              <text x="120" y="110" textAnchor="middle" fontSize="12" fill="#8b5cf6" fontWeight="bold" transform="rotate(-90 120 110)">p₅₀₀ = 150000 kg·m/s</text>
                              
                              {/* p100 final vector (30° E of S from origin) - scaled up */}
                              <line x1="175" y1="40" x2="245" y2="140" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-p100f)"/>
                              <text x="225" y="80" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold" transform="rotate(55 225 80)">p₁₀₀ = 40000 kg·m/s</text>                              {/* p500 final vector (completing triangle) - scaled up */}
                              <line x1="245" y1="140" x2="175" y2="180" stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrow-p500f)"/>
                              <text x="210" y="195" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold">p₅₀₀' = ?</text>
                                {/* Angle labels - no arcs, just labels positioned inside triangle */}
                              <text x="180" y="80" fontSize="10" fill="#dc2626" fontWeight="bold">30°</text>
                              
                              <text x="190" y="160" fontSize="10" fill="#2563eb" fontWeight="bold">θ</text>
                              
                              {/* Origin point */}
                              <circle cx="175" cy="40" r="3" fill="#000"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Calculate |p₅₀₀'| using the Cosine Law:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">Using the Cosine Law to find the magnitude:</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'c^2 = a^2 + b^2 - 2ab\\cos C'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{500}\'|^2 = |\\vec{p}_{500}|^2 + |\\vec{p}_{100}|^2 - 2|\\vec{p}_{500}||\\vec{p}_{100}|\\cos(30°)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{500}\'|^2 = (150000)^2 + (40000)^2 - 2(150000)(40000)\\cos(30°)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{500}\'|^2 = 22500000000 + 1600000000 - 12000000000(0.866)'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{500}\'|^2 = 24100000000 - 10392000000 = 13708000000'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{500}\'| = 117080\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">Calculate final velocity:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'v_{500}\' = \\frac{|\\vec{p}_{500}\'|}{m_{500}} = \\frac{117080\\text{ kg}\\cdot\\text{m/s}}{500\\text{ kg}} = 234\\text{ m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Find direction using the Sine Law:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">The direction angle θ for p₅₀₀':</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'\\frac{\\sin A}{a} = \\frac{\\sin C}{c}'}</InlineMath></div>
                          <div><InlineMath>{'\\frac{\\sin θ}{40000} = \\frac{\\sin(30°)}{117080}'}</InlineMath></div>
                          <div><InlineMath>{'\\sin θ = \\frac{40000 \\times \\sin(30°)}{117080} = \\frac{40000 \\times 0.500}{117080} = 0.171'}</InlineMath></div>
                          <div><InlineMath>{'θ = \\sin^{-1}(0.171) = 10°'}</InlineMath></div>
                        </div>
                        <p className="mt-2 text-sm ml-4">
                          Since the vector points west of the original south direction, the final direction is 10° W of S.
                        </p>
                      </div>
                    </li>                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium">
                          The final velocity of the 500 kg object is <InlineMath>{'\\vec{v}_{500}\' = 234\\text{ m/s [10° W of S]}'}</InlineMath>.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}        </div>
      </TextSection>      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample5Open(!isExample5Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 5 - Three Piece Explosion</h3>
            <span className="text-blue-600">{isExample5Open ? '▼' : '▶'}</span>
          </button>

          {isExample5Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 20 kg bomb is at rest. The bomb explodes into three pieces. A 2.50 kg piece moves 
                  south at 350 m/s and a 14.0 kg piece moves west at 95.0 m/s. What is the velocity 
                  of the other piece?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>

                  {/* Solution Steps */}
                  <ol className="space-y-4 text-sm">                    <li>
                      <strong>Calculate the known momentum vectors before and after the explosion:</strong>
                      <div className="pl-4 mt-2 space-y-2">
                        <p className="font-medium mb-2">Initial momentum (20 kg bomb at rest):</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{20} = m_{20} \\cdot \\vec{v}_{20} = 20\\text{ kg} \\times 0\\text{ m/s}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{20} = 0\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">2.50 kg piece momentum:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{2.5} = m_{2.5} \\cdot \\vec{v}_{2.5} = 2.50\\text{ kg} \\times 350\\text{ m/s [S]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{2.5} = 875\\text{ kg}\\cdot\\text{m/s [S]}'}</InlineMath></div>
                        </div>

                        <p className="font-medium mb-2 mt-4">14.0 kg piece momentum:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{14} = m_{14} \\cdot \\vec{v}_{14} = 14.0\\text{ kg} \\times 95.0\\text{ m/s [W]}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{14} = 1330\\text{ kg}\\cdot\\text{m/s [W]}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Apply conservation of momentum:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Since the bomb was initially at rest: <InlineMath>{'\\vec{p}_{initial} = 0'}</InlineMath></p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'\\vec{p}_{initial} = \\vec{p}_{2.5} + \\vec{p}_{14} + \\vec{p}_{3.5}'}</InlineMath></div>
                          <div><InlineMath>{'0 = \\vec{p}_{2.5} + \\vec{p}_{14} + \\vec{p}_{3.5}'}</InlineMath></div>
                          <div><InlineMath>{'\\vec{p}_{3.5} = -(\\vec{p}_{2.5} + \\vec{p}_{14})'}</InlineMath></div>
                        </div>
                        <p className="mt-2 text-sm ml-4">
                          The momentum of the 3.5 kg piece must balance the other two pieces.
                        </p>
                      </div>
                    </li>                    {/* Vector Diagram */}
                    <li>
                      <strong>Vector diagram - Right triangle formed tip-to-tail:</strong>
                      <div className="pl-4 mt-2">
                        <div className="bg-gray-50 p-4 rounded border">
                          <div className="w-full max-w-md mx-auto">
                            <svg width="100%" height="280" viewBox="0 0 400 280" className="border border-gray-300 bg-white rounded">
                              <defs>
                                <marker id="arrow-p25" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#dc2626" />
                                </marker>
                                <marker id="arrow-p14" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#ea580c" />
                                </marker>
                                <marker id="arrow-p35" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 5 2, 0 4" fill="#2563eb" />
                                </marker>
                              </defs>
                                {/* Starting point */}
                              <circle cx="200" cy="80" r="3" fill="#000"/>
                                {/* p2.5 vector (first vector - pointing south) */}
                              <line x1="200" y1="80" x2="200" y2="180" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow-p25)"/>
                              <text x="220" y="130" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold" transform="rotate(-90 220 130)">p₂.₅ = 875 kg·m/s</text>                              {/* p14 vector (second vector - pointing west from end of p2.5) */}
                              <line x1="200" y1="180" x2="100" y2="180" stroke="#ea580c" strokeWidth="3" markerEnd="url(#arrow-p14)"/>
                              <text x="150" y="200" textAnchor="middle" fontSize="12" fill="#ea580c" fontWeight="bold">p₁₄ = 1330 kg·m/s</text>                              {/* p3.5 vector (third vector - closing the triangle back to start) */}
                              <line x1="100" y1="180" x2="200" y2="80" stroke="#2563eb" strokeWidth="3" markerEnd="url(#arrow-p35)"/>
                              <text x="130" y="115" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="bold" transform="rotate(145 130 115)">P₃.₅ = ?</text>                              {/* Right angle indicator at the corner between orange and red vectors */}
                              <path d="M 190 180 L 190 170 L 200 170" stroke="#666" strokeWidth="1" fill="none"/>{/* Angle label for the direction of p3.5 */}
                              <text x="120" y="160" fontSize="10" fill="#2563eb" fontWeight="bold">θ</text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </li><li>
                      <strong>Calculate |p₃.₅| using Pythagorean theorem:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">Since we have a right triangle formed by the momentum vectors:</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'|\\vec{p}_{3.5}|^2 = |\\vec{p}_{2.5}|^2 + |\\vec{p}_{14}|^2'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{3.5}|^2 = (875)^2 + (1330)^2'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{3.5}|^2 = 765625 + 1768900 = 2534525'}</InlineMath></div>
                          <div><InlineMath>{'|\\vec{p}_{3.5}| = 1592\\text{ kg}\\cdot\\text{m/s}'}</InlineMath></div>
                        </div>
                        
                        <p className="font-medium mb-2 mt-4">Calculate velocity:</p>
                        <div className="space-y-1 ml-4">
                          <div><InlineMath>{'v_{3.5} = \\frac{|\\vec{p}_{3.5}|}{m_{3.5}} = \\frac{1592\\text{ kg}\\cdot\\text{m/s}}{3.5\\text{ kg}} = 455\\text{ m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Find direction:</strong>
                      <div className="pl-4 mt-2">
                        <p className="font-medium mb-2">Calculate the angle from the east direction:</p>
                        <div className="space-y-2 ml-4">
                          <div><InlineMath>{'\\tan θ = \\frac{|\\vec{p}_{2.5}|}{|\\vec{p}_{14}|} = \\frac{875}{1330} = 0.658'}</InlineMath></div>
                          <div><InlineMath>{'θ = \\tan^{-1}(0.658) = 33.3°'}</InlineMath></div>
                        </div>                        <p className="mt-2 text-sm ml-4">
                          The direction is 33.3° N of W (northwest).
                        </p>
                      </div>
                    </li>                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-2">                        <p className="font-medium">
                          The velocity of the 3.5 kg piece is <InlineMath>{'\\vec{v}_{3.5} = 455\\text{ m/s [33.3° N of W]}'}</InlineMath>.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}        </div>      </TextSection>      {/* Advanced Practice Problems */}
      <TextSection>
        <SlideshowKnowledgeCheck
          courseId="2"
          lessonPath="03-momentum-two-dimensions-advanced"
          questions={[
            {
              type: 'multiple-choice',
              question: 'Steel Ball Collision with Deflection',
              questionId: 'course2_03_steel_ball_deflection',
              points: 4
            },
            {
              type: 'multiple-choice',
              question: 'Mass Explosion Analysis',
              questionId: 'course2_03_mass_explosion',
              points: 4
            },
            {
              type: 'multiple-choice',
              question: 'Elastic Collision with 90° Separation',
              questionId: 'course2_03_elastic_collision_90',
              points: 4
            },
            {
              type: 'multiple-choice',
              question: 'Plasticene Inelastic Collision',
              questionId: 'course2_03_plasticene_collision',
              points: 4
            }
          ]}
          theme="blue"
        />
      </TextSection>

      <LessonSummary
        points={[
          "Momentum is a vector quantity that requires vector analysis in two or more dimensions",
          "Conservation of momentum applies independently to each direction (x and y components)",
          "Two main methods for solving 2D momentum problems: component method and vector addition method",
          "Component method: Break vectors into x and y components, apply conservation separately to each direction",
          "Vector addition method: Use geometric principles (cosine law and sine law) to solve momentum triangles",
          "In explosions and collisions, the vector sum of all momentum vectors before equals the vector sum after",
          "Always check that momentum is conserved in both magnitude and direction for complete solutions"
        ]}
      />
    </LessonContent>
  );
};

export default MomentumTwoDimensions;
