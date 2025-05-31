import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 4 - Graphing Techniques
 * Covers scientific graphing, linear relationships, and slope calculations
 */
const GraphingTechniques = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Collapsible section states
  const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
  const [isSlopeBasicsOpen, setIsSlopeBasicsOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);
  
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
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsIntroductionOpen(!isIntroductionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Introduction to Scientific Graphing</h3>
            <span className="text-blue-600">{isIntroductionOpen ? '▼' : '▶'}</span>
          </button>

          {isIntroductionOpen && (
            <div className="mt-4">
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
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsSlopeBasicsOpen(!isSlopeBasicsOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Calculating Slopes – The Basics</h3>
            <span className="text-blue-600">{isSlopeBasicsOpen ? '▼' : '▶'}</span>
          </button>

          {isSlopeBasicsOpen && (
            <div className="mt-4">
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
            <h3 className="text-xl font-semibold">Example 1 - Finding Mass from Energy-Height Data</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
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
            <h3 className="text-xl font-semibold">Example 2 - Finding Mass from Kinetic Energy-Speed Data</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
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
                        <BlockMath>{'\\text{slope} = \\frac{\\Delta E_k}{\\Delta v^2} = \\frac{250 - 50}{100 - 20} = \\frac{200\\text{ J}}{80\\text{ m}^2\\text{/s}^2} = 2.5\\text{ J·s}^2\\text{/m}^2'}</BlockMath>
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
                        <BlockMath>{'m = 2 \\times \\text{slope} = 2 \\times 2.5\\text{ J·s}^2\\text{/m}^2 = 5.0\\text{ kg}'}</BlockMath>
                      </div>
                      <p className="text-center font-semibold">
                        Answer: The mass of the object is 5.0 kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Practice Problems</h3>
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