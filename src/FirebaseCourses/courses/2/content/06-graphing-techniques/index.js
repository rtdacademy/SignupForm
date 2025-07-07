import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 4 - Graphing Techniques
 * Covers scientific graphing, linear relationships, and slope calculations
 */
const GraphingTechniques = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // Practice problem states
  const [currentProblemSet1, setCurrentProblemSet1] = useState(0);

  // Practice problem data
  const practiceProblems1 = [
    {
      id: 1,
      question: "A graph shows velocity (m/s) vs time (s) with points at (0, 5) and (10, 25). Calculate the slope and interpret its physical meaning.",
      given: ["Point 1: (0 s, 5 m/s)", "Point 2: (10 s, 25 m/s)", "Linear relationship"],
      equation: "\\text{slope} = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}",
      solution: "\\text{slope} = \\frac{25 - 5}{10 - 0} = \\frac{20}{10} = 2\\text{ m/s}^2",
      answer: "2 m/s² (acceleration)"
    },
    {
      id: 2,
      question: "From a force vs acceleration graph, two points are (2 N, 4 m/s²) and (8 N, 12 m/s²). Find the slope and the mass of the object.",
      given: ["Point 1: (2 N, 4 m/s²)", "Point 2: (8 N, 12 m/s²)", "F = ma relationship"],
      equation: "\\text{slope} = \\frac{1}{m}, \\text{ so } m = \\frac{1}{\\text{slope}}",
      solution: "\\text{slope} = \\frac{12 - 4}{8 - 2} = \\frac{8}{6} = \\frac{4}{3} \\Rightarrow m = \\frac{3}{4} = 0.75\\text{ kg}",
      answer: "0.75 kg"
    },
    {
      id: 3,
      question: "A distance vs time² graph has points at (1 s², 2 m) and (9 s², 18 m). Calculate the slope and relate it to acceleration.",
      given: ["Point 1: (1 s², 2 m)", "Point 2: (9 s², 18 m)", "d = ½at² relationship"],
      equation: "\\text{slope} = \\frac{a}{2}, \\text{ so } a = 2 \\times \\text{slope}",
      solution: "\\text{slope} = \\frac{18 - 2}{9 - 1} = \\frac{16}{8} = 2 \\Rightarrow a = 2 \\times 2 = 4\\text{ m/s}^2",
      answer: "4 m/s²"
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
  
  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    '2';
  
  // Debug logging
  useEffect(() => {
    console.log("🔥 Rendering GraphingTechniques component with:", {
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
      lessonId="lesson_1747281791046_200"
      title="Lesson 4 - Graphing Techniques"
      metadata={{ estimated_time: '45 minutes' }}
    >
      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Introduction to Scientific Graphing" 
            value="introduction-to-scientific-graphing" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                When scientists are trying to determine the relationship between variables they often 
                turn to graphical analysis. In addition, scientists often use graphs that form a best-fit 
                  straight line from which they can calculate a slope from which, in turn, they can 
                  calculate a required value. This lesson is designed for you to learn how to plot graphs 
                  from which we can calculate a desired value.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Why Use Graphs in Physics?</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <h5 className="font-semibold text-blue-700 mb-2">1. Visualize Relationships</h5>
                      <p className="text-sm text-blue-800">
                        Graphs make it easy to see how one variable changes with respect to another.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <h5 className="font-semibold text-blue-700 mb-2">2. Determine Mathematical Relationships</h5>
                      <p className="text-sm text-blue-800">
                        Linear graphs allow us to find slopes, which often represent important physical quantities.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <h5 className="font-semibold text-blue-700 mb-2">3. Extract Quantitative Information</h5>
                      <p className="text-sm text-blue-800">
                        From the slope and y-intercept, we can calculate unknown physical constants.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3">Key Graphing Principles:</h4>
                  <ul className="list-disc list-inside text-green-900 space-y-2">
                    <li>Choose appropriate scales that use most of the graph paper</li>
                    <li>Label axes with quantities and units</li>
                    <li>Plot points accurately and draw the best-fit line</li>
                    <li>Calculate slope using two well-separated points on the line</li>
                    <li>Interpret the slope in terms of the physical relationship</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Note:</h4>
                  <p className="text-yellow-900">
                    The slope of a graph has units that are the units of the y-axis divided by the units of the x-axis. 
                    This often corresponds to a meaningful physical quantity.
                  </p>
                </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Introduction to Scientific Graphing</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Calculating Slopes – The Basics" 
            value="calculating-slopes-the-basics" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                Recall from your previous course work that the basic procedure for creating graphs is:
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Step-by-Step Graphing Procedure:</h4>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">Choose a suitable scale</h5>
                          <p className="text-sm text-blue-800 mb-2">
                            Unfortunately students have often been taught to use the entire sheet of graph paper rather than 
                            using axis scales that are easy to use. In this course, <strong>always choose a scale that is easy to use</strong>. 
                            You do not need to use the entire sheet of graph paper.
                          </p>
                          <div className="bg-blue-100 p-2 rounded text-xs text-blue-900">
                            <strong>Good scales:</strong> 1, 2, 5, 10, 20, 50, 100, etc. per division<br/>
                            <strong>Avoid:</strong> 3, 7, 9, 13, etc. per division
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">Plot the points</h5>
                          <p className="text-sm text-blue-800">
                            Mark each data point clearly and accurately on the graph. Use small, precise dots or crosses.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">Draw a line-of-best-fit</h5>
                          <p className="text-sm text-blue-800 mb-2">
                            Use a ruler to draw the line-of-best-fit. <strong>The line-of-best-fit is more important than the points 
                            that were used to make the line.</strong>
                          </p>
                          <div className="bg-blue-100 p-2 rounded text-xs text-blue-900">
                            The line should pass as close as possible to all points, with roughly equal numbers of points above and below the line.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">Choose two points on the line</h5>
                          <p className="text-sm text-blue-800">
                            <strong>Important:</strong> Choose two points <em>on the line</em> (not original data points). 
                            Select points that are far apart to minimize calculation errors.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">Calculate the slope</h5>
                          <p className="text-sm text-blue-800 mb-2">
                            Calculate the slope of the line <strong>including units</strong> in the calculation.
                          </p>
                          <div className="text-center">
                            <BlockMath>{'\\text{slope} = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}'}</BlockMath>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Important Note About Variable Assignment:</h4>
                  <p className="text-yellow-900 mb-3">
                    In addition, in previous course work you were taught to place the manipulated/independent variable 
                    on the horizontal axis and the responding/dependent variable on the vertical axis. This is a good rule 
                    under some circumstances, however for our purposes the rule is too confining.
                  </p>
                  <div className="bg-white p-3 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>Our approach:</strong> We are more interested in relating the data to a known equation. 
                      Therefore our choice of which variable is assigned to which axis is dependent on how the data 
                      relates to a known equation.
                    </p>
                    <p className="text-sm text-yellow-800 font-medium">
                      Unless you are told to do so, do not worry about which is the dependent or independent variable.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Example: Choosing Axes Based on Known Equations</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">For equation: <InlineMath>{'d = v_0t + \\frac{1}{2}at^2'}</InlineMath></h5>
                      <p className="text-sm text-green-800">
                        Plot <strong>d vs t²</strong> to get a linear relationship where slope = ½a
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">For equation: <InlineMath>{'F = ma'}</InlineMath></h5>
                      <p className="text-sm text-green-800">
                        Plot <strong>F vs a</strong> to get a linear relationship where slope = m
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Calculating Slopes – The Basics</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 1 - Finding Mass from Energy-Height Data" 
            value="example-1-finding-mass-from-energy-height-data" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                Perhaps the best way to see how this works is to carefully read the following example.
                </p>
                
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The following data relating potential energy and height was obtained for an object. What is the mass of the object?
                </p>
                
                {/* Data Table */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3 text-center">Experimental Data</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-center">Height (m)</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Energy (kJ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">0</td><td className="border border-gray-300 px-4 py-2 text-center">0</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">5</td><td className="border border-gray-300 px-4 py-2 text-center">0.12</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">10</td><td className="border border-gray-300 px-4 py-2 text-center">0.25</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">15</td><td className="border border-gray-300 px-4 py-2 text-center">0.39</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">20</td><td className="border border-gray-300 px-4 py-2 text-center">0.49</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">25</td><td className="border border-gray-300 px-4 py-2 text-center">0.60</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <p className="mb-4">
                    A quick survey of the data indicates a direct relationship between energy and height.
                  </p>
                  
                  {/* Step-by-step process */}
                  <div className="space-y-6">
                    
                    {/* Step 1 */}
                    <div>
                      <p className="mb-2">
                        <strong>1.</strong> Find the equation that relates what we are given (energy, height) with what we want to find (mass). 
                        From our formula sheet, the equation is:
                      </p>
                      <div className="text-center">
                        <BlockMath>{'E = mgh'}</BlockMath>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div>
                      <p className="mb-2">
                        <strong>2.</strong> Rearrange the equation so that the given variables (E & h) calculate a slope:
                      </p>
                      <div className="text-center mb-2">
                        <BlockMath>{'\\frac{E}{h} = \\frac{mgh}{h} = mg'}</BlockMath>
                      </div>
                      <p className="text-center">
                        <InlineMath>{'\\text{slope} = \\frac{\\text{rise}}{\\text{run}} = \\frac{E}{h}'}</InlineMath>
                      </p>
                      <p className="text-center text-sm mt-1">
                        rise (E) is the vertical axis, run (h) is the horizontal axis<br/>
                        and the slope calculated from the graph equals (mg)
                      </p>
                    </div>
                    
                    {/* Step 3 - Graph */}
                    <div>
                      <p className="mb-3">
                        <strong>3.</strong> Plot the graph and calculate the slope
                      </p>
                          
                          <div className="mb-4">
                            <h6 className="font-semibold text-gray-800 mb-3 text-center">Potential Energy vs Height</h6>
                            
                            <div className="flex flex-col items-center">
                              <svg width="100%" height="400" viewBox="0 0 600 400" className="border border-gray-400 bg-white rounded max-w-lg">
                                {/* Grid lines */}
                                <defs>
                                  <pattern id="gridExample1" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                                  </pattern>
                                </defs>
                                <rect width="600" height="400" fill="url(#gridExample1)" />
                                
                                {/* Major grid lines */}
                                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => (
                                  <line key={`v${i}`} x1={30*i} y1="30" x2={30*i} y2="370" stroke="#ddd" strokeWidth="1"/>
                                ))}
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                  <line key={`h${i}`} x1="30" y1={30*i} x2="570" y2={30*i} stroke="#ddd" strokeWidth="1"/>
                                ))}
                                
                                {/* Axes */}
                                <line x1="60" y1="340" x2="570" y2="340" stroke="#333" strokeWidth="2"/>
                                <line x1="60" y1="340" x2="60" y2="60" stroke="#333" strokeWidth="2"/>
                                
                                {/* Data points: (0,0), (5,0.12), (10,0.25), (15,0.39), (20,0.49), (25,0.60) */}
                                {/* Scale: x-axis: 2m = 30px, y-axis: 0.25 kJ = 60px */}
                                <circle cx="60" cy="340" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                <circle cx="135" cy="311" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                <circle cx="210" cy="280" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                <circle cx="285" cy="246" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                <circle cx="360" cy="223" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                <circle cx="435" cy="196" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                                
                                {/* Best fit line extending to (28, 0.72) */}
                                <line x1="60" y1="340" x2="480" y2="168" stroke="#2563eb" strokeWidth="3"/>
                                
                                {/* Green triangle showing slope from (5,0.12) to (28,0.72) */}
                                <path d="M 135 311 L 480 168 L 480 311 Z" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2"/>
                                
                                {/* Slope calculation points and labels */}
                                <circle cx="135" cy="311" r="3" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                                <circle cx="480" cy="168" r="3" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                                
                                {/* Slope labels */}
                                <text x="140" y="325" fontSize="11" fill="#16a34a" fontWeight="bold">(5, 0.12)</text>
                                <text x="485" y="165" fontSize="11" fill="#16a34a" fontWeight="bold">(28, 0.72)</text>
                                
                                {/* Rise and run labels */}
                                <text x="500" y="240" fontSize="11" fill="#16a34a" fontWeight="bold">rise = 0.60</text>
                                <text x="300" y="330" fontSize="11" fill="#16a34a" fontWeight="bold">run = 23</text>
                                
                                {/* Axis labels */}
                                <text x="300" y="390" fontSize="16" textAnchor="middle" fontWeight="bold">Height (m)</text>
                                <text x="25" y="200" fontSize="16" textAnchor="middle" fontWeight="bold" transform="rotate(-90 25 200)">Energy (kJ)</text>
                                
                                {/* X-axis values - scale of 2 */}
                                <text x="60" y="355" fontSize="12" textAnchor="middle">0</text>
                                <text x="90" y="355" fontSize="12" textAnchor="middle">2</text>
                                <text x="120" y="355" fontSize="12" textAnchor="middle">4</text>
                                <text x="150" y="355" fontSize="12" textAnchor="middle">6</text>
                                <text x="180" y="355" fontSize="12" textAnchor="middle">8</text>
                                <text x="210" y="355" fontSize="12" textAnchor="middle">10</text>
                                <text x="240" y="355" fontSize="12" textAnchor="middle">12</text>
                                <text x="270" y="355" fontSize="12" textAnchor="middle">14</text>
                                <text x="300" y="355" fontSize="12" textAnchor="middle">16</text>
                                <text x="330" y="355" fontSize="12" textAnchor="middle">18</text>
                                <text x="360" y="355" fontSize="12" textAnchor="middle">20</text>
                                <text x="390" y="355" fontSize="12" textAnchor="middle">22</text>
                                <text x="420" y="355" fontSize="12" textAnchor="middle">24</text>
                                <text x="450" y="355" fontSize="12" textAnchor="middle">26</text>
                                <text x="480" y="355" fontSize="12" textAnchor="middle">28</text>
                                <text x="510" y="355" fontSize="12" textAnchor="middle">30</text>
                                
                                {/* Y-axis values */}
                                <text x="50" y="345" fontSize="12" textAnchor="end">0</text>
                                <text x="50" y="280" fontSize="12" textAnchor="end">0.25</text>
                                <text x="50" y="220" fontSize="12" textAnchor="end">0.50</text>
                                <text x="50" y="160" fontSize="12" textAnchor="end">0.75</text>
                                <text x="50" y="100" fontSize="12" textAnchor="end">1.00</text>
                              </svg>
                            </div>
                          </div>
                          
                          <p className="mb-2">
                            <strong>Slope calculation using two points on the line:</strong>
                          </p>
                          <div className="text-center">
                            <BlockMath>{'\\text{slope} = \\frac{\\Delta E}{\\Delta h} = \\frac{0.72 - 0.12}{28 - 5} = \\frac{0.60\\text{ kJ}}{23\\text{ m}} = 0.026\\text{ kJ/m} = 26\\text{ J/m}'}</BlockMath>
                          </div>
                          <p className="text-sm text-gray-600 mt-3 text-center">
                            The green triangle shows the rise and run used to calculate the slope between points (5, 0.12) and (28, 0.72) on the line of best fit.
                          </p>
                      </div>
                    </div>
                    
                    {/* Step 4 */}
                    <div>
                      <p className="mb-2">
                        <strong>4.</strong> The final step is to calculate the desired value (m):
                      </p>
                      <div className="text-center mb-2">
                        <BlockMath>{'\\text{slope} = mg'}</BlockMath>
                      </div>
                      <div className="text-center mb-2">
                        <BlockMath>{'m = \\frac{\\text{slope}}{g} = \\frac{26\\text{ J/m}}{9.81\\text{ m/s}^2} = 2.65\\text{ kg}'}</BlockMath>
                      </div>
                      <p className="text-center font-semibold">
                        Answer: The mass of the object is 2.65 kg
                      </p>
                    </div>
                  </div>
                </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1 - Finding Mass from Energy-Height Data</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 2 - Finding Mass from Kinetic Energy-Speed Data" 
            value="example-2-finding-mass-from-kinetic-energy-speed-data" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The following data relating kinetic energy and speed was obtained for an object. What is the mass of the object?
                </p>
                
                {/* Data Table */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3 text-center">Experimental Data</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-center">Speed (m/s)</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Energy (J)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">0</td><td className="border border-gray-300 px-4 py-2 text-center">0</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">2</td><td className="border border-gray-300 px-4 py-2 text-center">10</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">4</td><td className="border border-gray-300 px-4 py-2 text-center">40</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">6</td><td className="border border-gray-300 px-4 py-2 text-center">90</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">8</td><td className="border border-gray-300 px-4 py-2 text-center">160</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-center">10</td><td className="border border-gray-300 px-4 py-2 text-center">250</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <p className="mb-4">
                    A quick survey of the data indicates that E<sub>k</sub> increases at a different rate than the increase in v. 
                    This tells us that a direct relationship is unlikely.
                  </p>
                  
                  {/* Step-by-step process */}
                  <div className="space-y-6">
                    
                    {/* Step 1 */}
                    <div>
                      <p className="mb-2">
                        <strong>1.</strong> Find the equation that relates what we are given (kinetic energy, speed) with what we want to find (mass). 
                        From our formula sheet, the equation is:
                      </p>
                      <div className="text-center">
                        <BlockMath>{'E_k = \\frac{1}{2}mv^2'}</BlockMath>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div>
                      <p className="mb-2">
                        <strong>2.</strong> We note that E<sub>k</sub> is related to v². A graph of E<sub>k</sub> vs v will not produce a line, 
                        rather it results in a curve. Let us first plot E<sub>k</sub> vs v to illustrate this:
                      </p>
                      
                      <div className="mb-4">
                        <h6 className="font-semibold text-gray-800 mb-3 text-center">Kinetic Energy vs Speed (Curved Relationship)</h6>
                        
                        <div className="flex flex-col items-center">
                          <svg width="100%" height="350" viewBox="0 0 500 350" className="border border-gray-400 bg-white rounded max-w-lg">
                            {/* Grid lines */}
                            <defs>
                              <pattern id="gridExample2a" width="25" height="25" patternUnits="userSpaceOnUse">
                                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="500" height="350" fill="url(#gridExample2a)" />
                            
                            {/* Major grid lines */}
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => (
                              <line key={`v${i}`} x1={25*i} y1="25" x2={25*i} y2="300" stroke="#ddd" strokeWidth="1"/>
                            ))}
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                              <line key={`h${i}`} x1="25" y1={25*i} x2="475" y2={25*i} stroke="#ddd" strokeWidth="1"/>
                            ))}
                            
                            {/* Axes */}
                            <line x1="50" y1="275" x2="450" y2="275" stroke="#333" strokeWidth="2"/>
                            <line x1="50" y1="275" x2="50" y2="25" stroke="#333" strokeWidth="2"/>
                            
                            {/* Data points: (0,0), (2,10), (4,40), (6,90), (8,160), (10,250) */}
                            {/* Scale: x-axis: 2 m/s = 50px, y-axis: 50 J = 50px */}
                            <circle cx="50" cy="275" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="100" cy="265" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="150" cy="235" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="200" cy="185" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="250" cy="115" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="300" cy="25" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            
                            {/* Deep quadratic curve y = 2.5x² */}
                            <path d="M 50 275 Q 175 275 300 25" 
                              fill="none" stroke="#2563eb" strokeWidth="3"/>
                            
                            {/* Axis labels */}
                            <text x="250" y="320" fontSize="16" textAnchor="middle" fontWeight="bold">Speed (m/s)</text>
                            <text x="15" y="160" fontSize="16" textAnchor="middle" fontWeight="bold" transform="rotate(-90 15 160)">E<tspan baselineShift="sub">k</tspan> (J)</text>
                            
                            {/* X-axis values */}
                            <text x="50" y="290" fontSize="12" textAnchor="middle">0</text>
                            <text x="100" y="290" fontSize="12" textAnchor="middle">2</text>
                            <text x="150" y="290" fontSize="12" textAnchor="middle">4</text>
                            <text x="200" y="290" fontSize="12" textAnchor="middle">6</text>
                            <text x="250" y="290" fontSize="12" textAnchor="middle">8</text>
                            <text x="300" y="290" fontSize="12" textAnchor="middle">10</text>
                            <text x="350" y="290" fontSize="12" textAnchor="middle">12</text>
                            <text x="400" y="290" fontSize="12" textAnchor="middle">14</text>
                            <text x="450" y="290" fontSize="12" textAnchor="middle">16</text>
                            
                            {/* Y-axis values */}
                            <text x="40" y="280" fontSize="12" textAnchor="end">0</text>
                            <text x="40" y="225" fontSize="12" textAnchor="end">50</text>
                            <text x="40" y="175" fontSize="12" textAnchor="end">100</text>
                            <text x="40" y="125" fontSize="12" textAnchor="end">150</text>
                            <text x="40" y="75" fontSize="12" textAnchor="end">200</text>
                            <text x="40" y="25" fontSize="12" textAnchor="end">250</text>
                          </svg>
                        </div>
                      </div>
                      
                      <p className="text-center text-sm text-gray-600 mb-4">
                        Notice the curved relationship - this is not linear!
                      </p>
                    </div>
                    
                    {/* Step 3 */}
                    <div>
                      <p className="mb-2">
                        <strong>3.</strong> To produce a linear relationship, we can use the equation to guide us. Rearrange the equation so that the given variables (E<sub>k</sub> & v²) calculate a slope:
                      </p>
                      <div className="text-center mb-2">
                        <BlockMath>{'\\frac{E_k}{v^2} = \\frac{\\frac{1}{2}mv^2}{v^2} = \\frac{1}{2}m'}</BlockMath>
                      </div>
                      <p className="text-center">
                        <InlineMath>{'\\text{slope} = \\frac{\\text{rise}}{\\text{run}} = \\frac{E_k}{v^2}'}</InlineMath>
                      </p>
                      <p className="text-center text-sm mt-1">
                        rise (E<sub>k</sub>) is the vertical axis, run (v²) is the horizontal axis<br/>
                        and the slope calculated from the graph equals ½m
                      </p>
                    </div>
                    
                    {/* Step 4 - Modified Data Table */}
                    <div>
                      <p className="mb-3">
                        <strong>4.</strong> Add a third column to calculate v² from v, then plot E<sub>k</sub> vs v²:
                      </p>
                      
                      <div className="mb-4">
                        <h6 className="font-semibold text-gray-700 mb-3 text-center">Modified Data Table</h6>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-center">Speed (m/s)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Energy (J)</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">v² (m²/s²)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">0</td><td className="border border-gray-300 px-4 py-2 text-center">0</td><td className="border border-gray-300 px-4 py-2 text-center">0</td></tr>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">2</td><td className="border border-gray-300 px-4 py-2 text-center">10</td><td className="border border-gray-300 px-4 py-2 text-center">4</td></tr>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">4</td><td className="border border-gray-300 px-4 py-2 text-center">40</td><td className="border border-gray-300 px-4 py-2 text-center">16</td></tr>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">6</td><td className="border border-gray-300 px-4 py-2 text-center">90</td><td className="border border-gray-300 px-4 py-2 text-center">36</td></tr>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">8</td><td className="border border-gray-300 px-4 py-2 text-center">160</td><td className="border border-gray-300 px-4 py-2 text-center">64</td></tr>
                              <tr><td className="border border-gray-300 px-4 py-2 text-center">10</td><td className="border border-gray-300 px-4 py-2 text-center">250</td><td className="border border-gray-300 px-4 py-2 text-center">100</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h6 className="font-semibold text-gray-800 mb-3 text-center">Kinetic Energy vs Speed² (Linear Relationship)</h6>
                        
                        <div className="flex flex-col items-center">
                          <svg width="100%" height="400" viewBox="0 0 600 400" className="border border-gray-400 bg-white rounded max-w-lg">
                            {/* Grid lines */}
                            <defs>
                              <pattern id="gridExample2b" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="600" height="400" fill="url(#gridExample2b)" />
                            
                            {/* Major grid lines */}
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(i => (
                              <line key={`v${i}`} x1={30*i} y1="30" x2={30*i} y2="340" stroke="#ddd" strokeWidth="1"/>
                            ))}
                            {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
                              <line key={`h${i}`} x1="30" y1={30*i} x2="540" y2={30*i} stroke="#ddd" strokeWidth="1"/>
                            ))}
                            
                            {/* Axes */}
                            <line x1="60" y1="340" x2="540" y2="340" stroke="#333" strokeWidth="2"/>
                            <line x1="60" y1="340" x2="60" y2="60" stroke="#333" strokeWidth="2"/>
                            
                            {/* Data points: (0,0), (4,10), (16,40), (36,90), (64,160), (100,250) */}
                            {/* Scale: x-axis: 10 m²/s² = 30px, y-axis: 25 J = 30px */}
                            <circle cx="60" cy="340" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="72" cy="328" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="108" cy="292" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="168" cy="232" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="252" cy="148" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            <circle cx="360" cy="40" r="4" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                            
                            {/* Best fit line adjusted to pass near the plotted points */}
                            <line x1="60" y1="340" x2="360" y2="40" stroke="#2563eb" strokeWidth="3"/>
                            
                            {/* Green triangle showing slope from (20,50) to (100,250) */}
                            <path d="M 120 280 L 360 40 L 360 280 Z" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2"/>
                            
                            {/* Slope calculation points and labels */}
                            <circle cx="120" cy="280" r="3" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                            <circle cx="360" cy="40" r="3" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                            
                            {/* Slope labels */}
                            <text x="125" y="295" fontSize="11" fill="#16a34a" fontWeight="bold">(20, 50)</text>
                            <text x="365" y="35" fontSize="11" fill="#16a34a" fontWeight="bold">(100, 250)</text>
                            
                            {/* Rise and run labels */}
                            <text x="380" y="160" fontSize="11" fill="#16a34a" fontWeight="bold">rise = 200</text>
                            <text x="220" y="300" fontSize="11" fill="#16a34a" fontWeight="bold">run = 80</text>
                            
                            {/* Axis labels */}
                            <text x="300" y="380" fontSize="16" textAnchor="middle" fontWeight="bold">v² (m²/s²)</text>
                            <text x="25" y="200" fontSize="16" textAnchor="middle" fontWeight="bold" transform="rotate(-90 25 200)">E<tspan baselineShift="sub">k</tspan> (J)</text>
                            
                            {/* X-axis values */}
                            <text x="60" y="355" fontSize="12" textAnchor="middle">0</text>
                            <text x="120" y="355" fontSize="12" textAnchor="middle">20</text>
                            <text x="180" y="355" fontSize="12" textAnchor="middle">40</text>
                            <text x="240" y="355" fontSize="12" textAnchor="middle">60</text>
                            <text x="300" y="355" fontSize="12" textAnchor="middle">80</text>
                            <text x="360" y="355" fontSize="12" textAnchor="middle">100</text>
                            
                            {/* Y-axis values */}
                            <text x="50" y="345" fontSize="12" textAnchor="end">0</text>
                            <text x="50" y="280" fontSize="12" textAnchor="end">50</text>
                            <text x="50" y="220" fontSize="12" textAnchor="end">100</text>
                            <text x="50" y="160" fontSize="12" textAnchor="end">150</text>
                            <text x="50" y="100" fontSize="12" textAnchor="end">200</text>
                            <text x="50" y="40" fontSize="12" textAnchor="end">250</text>
                          </svg>
                        </div>
                      </div>
                      
                      <p className="mb-2">
                        <strong>Slope calculation using two points on the line:</strong>
                      </p>
                      <div className="text-center">
                        <BlockMath>{'\\text{slope} = \\frac{\\Delta E_k}{\\Delta v^2} = \\frac{250 - 50}{100 - 20} = \\frac{200\\text{ J}}{80\\text{ m}^2\\text{/s}^2} = 2.5\\text{ J}\\cdot\\text{s}^2\\text{/m}^2'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        The green triangle shows the rise and run used to calculate the slope between points (20, 50) and (100, 250) on the line of best fit.
                      </p>
                    </div>
                    
                    {/* Step 5 */}
                    <div>
                      <p className="mb-2">
                        <strong>5.</strong> The final step is to calculate the desired value (m):
                      </p>
                      <div className="text-center mb-2">
                        <BlockMath>{'\\text{slope} = \\frac{1}{2}m'}</BlockMath>
                      </div>
                      <div className="text-center mb-2">
                        <BlockMath>{'m = 2 \\times \\text{slope} = 2 \\times 2.5\\text{ J}\\cdot\\text{s}^2\\text{/m}^2 = 5.0\\text{ kg}'}</BlockMath>
                      </div>
                      <p className="text-center font-semibold">
                        Answer: The mass of the object is 5.0 kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2 - Finding Mass from Kinetic Energy-Speed Data</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 3 - Work Done from Power-Time Data" 
            value="example-3-work-done-from-power-time-data" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The following data relating power and time was obtained for an object. What is the work done on the object?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  {/* Data Table */}
                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full max-w-md mx-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Power (W)</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Time (s)</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">1/t (s⁻¹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2">50</td><td className="border border-gray-300 px-4 py-2">2</td><td className="border border-gray-300 px-4 py-2">0.50</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2">25</td><td className="border border-gray-300 px-4 py-2">4</td><td className="border border-gray-300 px-4 py-2">0.25</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2">17</td><td className="border border-gray-300 px-4 py-2">6</td><td className="border border-gray-300 px-4 py-2">0.17</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2">13</td><td className="border border-gray-300 px-4 py-2">8</td><td className="border border-gray-300 px-4 py-2">0.13</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2">10</td><td className="border border-gray-300 px-4 py-2">10</td><td className="border border-gray-300 px-4 py-2">0.10</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2">8</td><td className="border border-gray-300 px-4 py-2">12</td><td className="border border-gray-300 px-4 py-2">0.08</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-4">
                    <li>
                      <strong>Analyze the relationship:</strong>
                      <p className="mt-2 ml-4">
                        A quick survey of the data indicates that there is an inverse relationship between power 
                        and time (i.e., the greater the power, the less time is required).
                      </p>
                    </li>
                    
                    <li>
                      <strong>Find the equation that relates P, t, and W:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{'W = P \\times t'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Graph P vs t (for illustration):</strong>
                      <div className="mt-3 mb-3 p-4 bg-gray-100 rounded-lg border border-gray-300">
                        <svg width="100%" height="325" viewBox="0 0 400 325" className="border border-gray-400 bg-white rounded">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid1" width="25" height="25" patternUnits="userSpaceOnUse">
                              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="400" height="325" fill="url(#grid1)" />
                          
                          {/* Axes */}
                          <line x1="50" y1="275" x2="350" y2="275" stroke="#333" strokeWidth="2"/>
                          <line x1="50" y1="275" x2="50" y2="25" stroke="#333" strokeWidth="2"/>
                          
                          {/* Axis labels */}
                          <text x="200" y="310" fontSize="14" textAnchor="middle">t (s)</text>
                          <text x="20" y="150" fontSize="14" textAnchor="middle" transform="rotate(-90 20 150)">P (W)</text>
                          
                          {/* Time axis values */}
                          <text x="50" y="290" fontSize="12" textAnchor="middle">0</text>
                          <text x="100" y="290" fontSize="12" textAnchor="middle">2</text>
                          <text x="150" y="290" fontSize="12" textAnchor="middle">4</text>
                          <text x="200" y="290" fontSize="12" textAnchor="middle">6</text>
                          <text x="250" y="290" fontSize="12" textAnchor="middle">8</text>
                          <text x="300" y="290" fontSize="12" textAnchor="middle">10</text>
                          <text x="350" y="290" fontSize="12" textAnchor="middle">12</text>
                          
                          {/* Power axis values */}
                          <text x="40" y="280" fontSize="12" textAnchor="end">0</text>
                          <text x="40" y="230" fontSize="12" textAnchor="end">10</text>
                          <text x="40" y="180" fontSize="12" textAnchor="end">20</text>
                          <text x="40" y="130" fontSize="12" textAnchor="end">30</text>
                          <text x="40" y="80" fontSize="12" textAnchor="end">40</text>
                          <text x="40" y="30" fontSize="12" textAnchor="end">50</text>
                          
                          {/* Data points (scattered) */}
                          <circle cx="100" cy="30" r="4" fill="#2563eb"/>  {/* (2, 50) */}
                          <circle cx="150" cy="152.5" r="4" fill="#2563eb"/> {/* (4, 25) */}
                          <circle cx="200" cy="191.7" r="4" fill="#2563eb"/> {/* (6, 17) */}
                          <circle cx="250" cy="211.3" r="4" fill="#2563eb"/> {/* (8, 13) */}
                          <circle cx="300" cy="226" r="4" fill="#2563eb"/> {/* (10, 10) */}
                          <circle cx="350" cy="235.8" r="4" fill="#2563eb"/> {/* (12, 8) */}
                          
                          {/* Best fit curve P = 100/t - smooth hyperbola */}
                          <path d="M 100,30 C 106,55 112.5,80 125,111.8 C 137.5,132 150,152.5 162.5,166 C 175,180 187.5,187 200,193.2 C 212.5,199 225,205.4 237.5,209.5 C 250,213.8 262.5,217.2 275,220.6 C 287.5,223.3 300,226 312.5,228.3 C 325,230.6 337.5,232.4 350,234.2 Q 365,237 380,239" 
                                fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3"/>
                          
                          <text x="200" y="20" fontSize="13" textAnchor="middle" fontWeight="bold">P vs t (Inverse Relationship)</text>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Since P and t are in an inverse relationship, a graph of P vs t produces a curve, not a line.
                      </p>
                    </li>
                    
                    <li>
                      <strong>Transform to linear relationship:</strong>
                      <p className="mt-2 ml-4 mb-3">
                        To produce a linear relationship from an inverse relationship, we invert one of the 
                        variables and then graph the result. The equation becomes:
                      </p>
                      <div className="text-center mb-3">
                        <BlockMath>{'W = P \\times t \\quad \\Rightarrow \\quad P = W \\times \\frac{1}{t}'}</BlockMath>
                      </div>
                      <p className="ml-4">
                        Where P is the vertical axis, 1/t is the horizontal axis, and slope = W
                      </p>
                    </li>
                    
                    <li>
                      <strong>Graph P vs 1/t:</strong>
                      <div className="mt-3 mb-3 p-4 bg-gray-100 rounded-lg border border-gray-300">
                        <svg width="100%" height="300" viewBox="0 0 400 300" className="border border-gray-400 bg-white rounded">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid2" width="40" height="25" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="400" height="300" fill="url(#grid2)" />
                          
                          {/* Axes */}
                          <line x1="50" y1="250" x2="350" y2="250" stroke="#333" strokeWidth="2"/>
                          <line x1="50" y1="250" x2="50" y2="30" stroke="#333" strokeWidth="2"/>
                          
                          {/* Axis labels */}
                          <text x="200" y="285" fontSize="14" textAnchor="middle">1/t (s⁻¹)</text>
                          <text x="20" y="140" fontSize="14" textAnchor="middle" transform="rotate(-90 20 140)">P (W)</text>
                          
                          {/* 1/t axis values */}
                          <text x="50" y="265" fontSize="12" textAnchor="middle">0</text>
                          <text x="90" y="265" fontSize="12" textAnchor="middle">0.1</text>
                          <text x="130" y="265" fontSize="12" textAnchor="middle">0.2</text>
                          <text x="170" y="265" fontSize="12" textAnchor="middle">0.3</text>
                          <text x="210" y="265" fontSize="12" textAnchor="middle">0.4</text>
                          <text x="250" y="265" fontSize="12" textAnchor="middle">0.5</text>
                          <text x="290" y="265" fontSize="12" textAnchor="middle">0.6</text>
                          
                          {/* Power axis values */}
                          <text x="40" y="255" fontSize="12" textAnchor="end">0</text>
                          <text x="40" y="205" fontSize="12" textAnchor="end">10</text>
                          <text x="40" y="155" fontSize="12" textAnchor="end">20</text>
                          <text x="40" y="105" fontSize="12" textAnchor="end">30</text>
                          <text x="40" y="55" fontSize="12" textAnchor="end">40</text>
                          <text x="40" y="35" fontSize="12" textAnchor="end">50</text>
                          
                          {/* Data points */}
                          <circle cx="250" cy="50" r="4" fill="#22c55e"/> {/* (0.50, 50) */}
                          <circle cx="170" cy="125" r="4" fill="#22c55e"/> {/* (0.25, 25) */}
                          <circle cx="118" cy="165" r="4" fill="#22c55e"/> {/* (0.17, 17) */}
                          <circle cx="102" cy="186" r="4" fill="#22c55e"/> {/* (0.13, 13) */}
                          <circle cx="90" cy="200" r="4" fill="#22c55e"/>  {/* (0.10, 10) */}
                          <circle cx="82" cy="210" r="4" fill="#22c55e"/>  {/* (0.08, 8) */}
                          
                          {/* Best fit line */}
                          <line x1="50" y1="250" x2="260" y2="40" stroke="#22c55e" strokeWidth="2"/>
                          
                          {/* Slope calculation visualization */}
                          <line x1="90" y1="200" x2="250" y2="200" stroke="#666" strokeWidth="1" strokeDasharray="3,3"/>
                          <line x1="250" y1="200" x2="250" y2="50" stroke="#666" strokeWidth="1" strokeDasharray="3,3"/>
                          
                          <text x="170" y="215" fontSize="11" fill="#666">Δ(1/t) = 0.4</text>
                          <text x="260" y="125" fontSize="11" fill="#666">ΔP = 40</text>
                          
                          <text x="200" y="20" fontSize="13" textAnchor="middle" fontWeight="bold">P vs 1/t (Linear Relationship)</text>
                        </svg>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate the work done (W):</strong>
                      <div className="mt-2 ml-4">
                        <p className="mb-2">From the graph, we calculate the slope:</p>
                        <div className="text-center mb-3">
                          <BlockMath>{'\\text{slope} = \\frac{\\Delta P}{\\Delta(1/t)} = \\frac{40\\text{ W}}{0.4\\text{ s}^{-1}} = 100\\text{ W}\\times\\text{s}'}</BlockMath>
                        </div>
                        <p>Since slope = W:</p>
                        <div className="text-center">
                          <BlockMath>{'W = 100\\text{ W}\\times\\text{s} = 100\\text{ J}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The work done on the object is <InlineMath>{'W = 100\\text{ J}'}</InlineMath>
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      This example demonstrates how to analyze inverse relationships by transforming them into 
                      linear relationships, making it easier to extract meaningful physical quantities from the data.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 3 - Work Done from Power-Time Data</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

      <TextSection>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Graphing Analysis Knowledge Check</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-900">
              <strong>Instructions:</strong> For each question below, use the provided data table to sketch the graph on paper. 
              Determine the line of best fit and calculate the slope. 
            </p>
          </div>
          
          <SlideshowKnowledgeCheck
          onAIAccordionContent={onAIAccordionContent} 
onAIAccordionContent={onAIAccordionContent}
            courseId={courseId}
            lessonPath="06-graphing-techniques"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_06_graphing_techniques_question1',
                title: 'Question 1: Distance vs Time Analysis'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_06_graphing_techniques_question2',
                title: 'Question 2: Force vs Acceleration Analysis'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_06_graphing_techniques_question3',
                title: 'Question 3: Velocity vs Time Analysis'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_06_graphing_techniques_question4',
                title: 'Question 4: Current vs Voltage Analysis'
              }
            ]}
            onComplete={(score, results) => console.log(`Graphing Techniques Knowledge Check completed with ${score}%`)}
            theme="green"
          />
        </div>
      </TextSection>

      <LessonSummary
        points={[
          "Graphs help visualize relationships between physical variables",
          "Linear graphs allow calculation of slopes that represent physical quantities",
          "Slope = Δy/Δx and has units of y-axis units divided by x-axis units",
          "Common physics graphs: position vs time (slope = velocity), velocity vs time (slope = acceleration)",
          "Best-fit lines through data points provide the most accurate slope calculations"
        ]}
      />
    </LessonContent>
  );
};

export default GraphingTechniques;