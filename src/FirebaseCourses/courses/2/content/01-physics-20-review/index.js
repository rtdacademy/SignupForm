import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
// TEMPORARY FIX: Commented out to avoid Firebase permission errors
// import { useAuth } from '../../../../../context/AuthContext';
// import { getFunctions } from 'firebase/functions';
// import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { DynamicQuestion } from '../../../../components/assessments';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import StandardMultipleChoiceQuestion from '../../../../components/assessments/StandardMultipleChoiceQuestion';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const Physics20Review = ({ course, courseId = '2', onPrepopulateMessage, createAskAIButton, createAskAIButtonFromElement,
AIAccordion, onAIAccordionContent }) => {


  // TEMPORARY FIX: Removed useAuth dependency to avoid permission errors
  // const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(0);

  // Assessment ID for the dynamic question
  const dynamicQuestionId = 'q1_physics_calculation';

  // Get courseId from the course object - check different possible formats
  const effectiveCourseId = String(course?.CourseID || course?.courseId || course?.id || courseId || 'PHY30');

  // TEMPORARY FIX: Commented out authentication check to avoid permission errors
  useEffect(() => {
    // Skip authentication check temporarily
    // if (!currentUser) {
    //   console.error("❌ No authenticated user found");
    //   setError("You must be logged in to view this lesson");
    //   setLoading(false);
    //   return;
    // }

    if (!course) {
      console.error("❌ No course data provided");
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    // Skip email check temporarily
    // if (!currentUser.email) {
    //   console.error("❌ User has no email");
    //   setError("User email is required");
    //   setLoading(false);
    //   return;
    // }

    // The DynamicQuestion component handles its own database interactions
    setLoading(false);
  }, [course]); // Removed currentUser dependency



  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281754691_113"
    
    >
      <TextSection title="Welcome to Physics 30">
        <p className="mb-4">
          The Physics 30 course builds on a number of ideas and skills that you learned in Physics 20. 
          Physics 30 requires that the following ideas and skills are well understood:
        </p>
        <ul className="list-none pl-6 mb-6 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">⇒</span>
            <span className="font-medium">manipulation of equations with ease <span className="text-red-600">(Essential)</span></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⇒</span>
            <span>problem solving – proper selection of equations and identifying known and unknown quantities</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⇒</span>
            <span>adding and calculating vectors</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⇒</span>
            <span>understanding the dynamics of situations (i.e. application of Newton's laws)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⇒</span>
            <span>uniform circular motion</span>
          </li>
        </ul>
      </TextSection>

      {/* AI-Enhanced Examples Section */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="example1" title="Example 1: Free Fall Motion" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving free fall motion, using our understanding of kinematics equations.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">How fast will an object be travelling after falling for 7.0 s?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Initial velocity:</div>
                              <div><InlineMath>{`v_0 = 0~\\text{m/s}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The object starts from rest, meaning it has no initial velocity
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Time:</div>
                              <div><InlineMath>{`t = 7.0~\\text{s}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Total time of fall
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Acceleration due to gravity:</div>
                              <div><InlineMath>{`g = -9.81~\\text{m/s}^2`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The negative sign indicates downward acceleration
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Select appropriate equation:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For velocity under constant acceleration:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`v = v_0 + gt`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          This equation is used when acceleration is constant and we know the time of motion
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`v = 0~\\text{m/s} + (-9.81~\\text{m/s}^2)(7.0~\\text{s})`}</BlockMath>
                        <BlockMath>{`v = -68.67~\\text{m/s}~\\text{(exact calculation)}`}</BlockMath>
                        <BlockMath>{`v = -69~\\text{m/s}~\\text{(rounded to 2 significant figures)}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                        <span>The object will be travelling at <InlineMath>{`69~\\text{m/s}`}</InlineMath> downward</span>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            This is approximately 250 km/h!
                          </div>
                        </span>
                      </p>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: Final answer rounded to 2 significant figures based on the given time value (7.0 s)</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Since our initial time measurement has 2 significant figures (7.0), our final answer should also have 2 significant figures (69). When multiplying values, the result should have the same number of significant figures as the least precise measurement.
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2: Building Height" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving initial velocity and displacement using kinematics equations.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A man standing on the roof of a building throws a stone downward at 20 m/s and the stone hits the ground after 5.0 s. How tall is the building?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Initial velocity:</div>
                              <div><InlineMath>{`v_0 = 20~\\text{m/s}`}</InlineMath> downward</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Initial velocity is positive downward in this case
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Time:</div>
                              <div><InlineMath>{`t = 5.0~\\text{s}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Total time until the stone hits the ground
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Acceleration due to gravity:</div>
                              <div><InlineMath>{`g = 9.81~\\text{m/s}^2`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Positive because downward is positive in this case
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Select appropriate equation:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For displacement under constant acceleration:</p>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            This equation gives us displacement when we know initial velocity, acceleration, and time
                          </div>
                        </span>
                        <BlockMath>{`d = v_0t + \\frac{1}{2}gt^2`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`d = (20~\\text{m/s})(5.0~\\text{s}) + \\frac{1}{2}(9.81~\\text{m/s}^2)(5.0~\\text{s})^2`}</BlockMath>
                        <BlockMath>{`d = 100~\\text{m} + \\frac{1}{2}(9.81)(25)~\\text{m}`}</BlockMath>
                        <BlockMath>{`d = 100~\\text{m} + 122.625~\\text{m} = 222.625~\\text{m}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                        <span>The building is <InlineMath>{`2.2 \\times 10^2~\\text{m}`}</InlineMath> tall</span>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            This is equivalent to a ~72-story building!
                          </div>
                        </span>
                      </p>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: Final answer rounded to 2 significant figures based on the given time value (5.0 s)</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Time has 2 significant figures, so our final answer should also have 2 significant figures
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            {/* Kinematics Knowledge Check */}
            <TextSection>
              <div className="my-8">
                <SlideshowKnowledgeCheck
                  courseId={courseId}
                  lessonPath="01-physics-20-review"
                  course={course}
                  onAIAccordionContent={onAIAccordionContent}
                  questions={[
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question1',
                      title: 'Question 1: Displacement'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question2',
                      title: 'Question 2: Speed and Time'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question3',
                      title: 'Question 3: Average Speed'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question4',
                      title: 'Question 4: Acceleration'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question5',
                      title: 'Question 5: Vertical Motion'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question6',
                      title: 'Question 6: Motion on Slope'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question7',
                      title: 'Question 7: Electron Acceleration'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question8',
                      title: 'Question 8: Projectile Time'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question9',
                      title: 'Question 9: Falling Objects'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question10',
                      title: 'Question 10: Free Fall'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question11',
                      title: 'Question 11: Maximum Height'
                    },
                    {
                      type: 'multiple-choice',
                      questionId: 'course2_01_physics_20_review_question12',
                      title: 'Question 12: Horizontal Projectile'
                    }
                  ]}
                />
              </div>
            </TextSection>

            <AIAccordion.Item value="example3" title="Example 3: Vector Components" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving vector components using trigonometry.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">An airplane flies at a velocity of 500 km/h at 60° N of W. What are the x and y components of the airplane's velocity?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Velocity magnitude:</div>
                              <div><InlineMath>{`|\\vec{v}| = 500~\\text{km/h}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The magnitude of the velocity vector
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Direction:</div>
                              <div>60° N of W</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  60° north of west, or 120° from positive x-axis
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Draw a vector diagram:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Set up coordinate system with positive x-axis pointing East, positive y-axis pointing North</p>
                        
                        {/* Vector Diagram */}
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-4 flex justify-center">
                          <svg viewBox="0 0 340 260" className="w-full max-w-lg mx-auto border border-gray-300 bg-gray-50">
                            {/* Coordinate axes */}
                            <defs>
                              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#374151" />
                              </marker>
                            </defs>
                            
                            {/* Grid lines for better visualization */}
                            <defs>
                              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect x="30" y="30" width="280" height="200" fill="url(#grid)" opacity="0.3"/>
                            
                            {/* X-axis (East-West) - centered for 2nd quadrant focus */}
                            <line x1="50" y1="170" x2="310" y2="170" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
                            <text x="315" y="165" fontSize="10" fill="#374151" fontWeight="bold">E</text>
                            <text x="35" y="165" fontSize="10" fill="#374151" fontWeight="bold">W</text>
                            
                            {/* Y-axis (North-South) */}
                            <line x1="170" y1="220" x2="170" y2="50" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
                            <text x="160" y="45" fontSize="10" fill="#374151" fontWeight="bold">N</text>
                            <text x="160" y="235" fontSize="10" fill="#374151" fontWeight="bold">S</text>
                            
                            {/* Origin */}
                            <circle cx="170" cy="170" r="3" fill="#374151" />
                            <text x="175" y="185" fontSize="9" fill="#374151" fontWeight="bold">O</text>
                            
                            {/* Velocity vector at 120° in standard position (longer to fill quadrant) */}
                            <line x1="170" y1="170" x2="90" y2="90" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead)" />
                            
                            {/* Vector components with enhanced visibility */}
                            {/* x-component (westward) - horizontal dashed line */}
                            <line x1="170" y1="170" x2="90" y2="170" stroke="#2563eb" strokeWidth="2" strokeDasharray="6,3" />
                            <text x="125" y="185" fontSize="9" fill="#2563eb" fontWeight="bold">vₓ</text>
                            
                            {/* y-component (northward) - vertical dashed line */}
                            <line x1="90" y1="170" x2="90" y2="90" stroke="#059669" strokeWidth="2" strokeDasharray="6,3" />
                            <text x="75" y="135" fontSize="9" fill="#059669" fontWeight="bold">vᵧ</text>
                            
                            {/* Angle arc - showing 60° from negative x-axis, moved left and down */}
                            <path d="M 150 170 A 20 20 0 0 1 158 154" stroke="#f59e0b" strokeWidth="2" fill="none" />
                            <text x="130" y="158" fontSize="9" fill="#f59e0b" fontWeight="bold">60°</text>
                            
                            {/* Vector label - positioned above the vector */}
                            <text x="110" y="105" fontSize="8" fill="#dc2626">|v| = 500km/h</text>
                            
                            {/* Right angle indicator at component intersection - original position */}
                            <rect x="82" y="162" width="8" height="8" fill="none" stroke="#374151" strokeWidth="1"/>
                          </svg>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="border-b border-dotted border-blue-300 inline-block text-sm text-gray-600">
                            The diagram shows the velocity vector and its components
                          </p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Red arrow: velocity vector; Blue dashed: x-component (west); Green dashed: y-component (north)
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate x-component (East-West):</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Since the plane is flying 60° N of W, the angle from the negative x-axis is 60°.</p>
                        <BlockMath>{`v_x = |\\vec{v}| \\cos(180° - 60°) = |\\vec{v}| \\cos(120°)`}</BlockMath>
                        <BlockMath>{`v_x = 500 \\times \\cos(120°) = 500 \\times (-0.5) = -250~\\text{km/h}`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">Negative indicates westward direction</p>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate y-component (North-South):</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`v_y = |\\vec{v}| \\sin(180° - 60°) = |\\vec{v}| \\sin(120°)`}</BlockMath>
                        <BlockMath>{`v_y = 500 \\times \\sin(120°) = 500 \\times \\frac{\\sqrt{3}}{2} = 500 \\times 0.866 = 433~\\text{km/h}`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">Positive indicates northward direction</p>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center mb-2">
                          <span>x-component: <InlineMath>{`v_x = 250~\\text{km/h}`}</InlineMath> west</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The magnitude is 250 km/h in the westward direction
                            </div>
                          </span>
                        </div>
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>y-component: <InlineMath>{`v_y = 433~\\text{km/h}`}</InlineMath> north</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The magnitude is 433 km/h in the northward direction
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4: Vector Addition" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving multiple vector displacements using vector addition.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A man walks 40 m at 30° N of E, then 70 m at 60° S of E, and finally 20 m at 45° N of W. What is the displacement of the man?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify the three displacement vectors:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Vector 1:</div>
                              <div><InlineMath>{`\\vec{d_1} = 40~\\text{m}`}</InlineMath> at 30° N of E</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  First displacement: 30° counterclockwise from positive x-axis
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Vector 2:</div>
                              <div><InlineMath>{`\\vec{d_2} = 70~\\text{m}`}</InlineMath> at 60° S of E</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Second displacement: 60° clockwise from positive x-axis (or -60°)
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Vector 3:</div>
                              <div><InlineMath>{`\\vec{d_3} = 20~\\text{m}`}</InlineMath> at 45° N of W</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Third displacement: 135° counterclockwise from positive x-axis
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate x-components:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`d_{1x} = 40 \\cos(30°) = 40 \\times 0.866 = 34.6~\\text{m}`}</BlockMath>
                        <BlockMath>{`d_{2x} = 70 \\cos(-60°) = 70 \\times 0.5 = 35.0~\\text{m}`}</BlockMath>
                        <BlockMath>{`d_{3x} = 20 \\cos(135°) = 20 \\times (-0.707) = -14.1~\\text{m}`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">Total x-component:</p>
                        <BlockMath>{`d_x = 34.6 + 35.0 + (-14.1) = 55.5~\\text{m}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate y-components:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`d_{1y} = 40 \\sin(30°) = 40 \\times 0.5 = 20.0~\\text{m}`}</BlockMath>
                        <BlockMath>{`d_{2y} = 70 \\sin(-60°) = 70 \\times (-0.866) = -60.6~\\text{m}`}</BlockMath>
                        <BlockMath>{`d_{3y} = 20 \\sin(135°) = 20 \\times 0.707 = 14.1~\\text{m}`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">Total y-component:</p>
                        <BlockMath>{`d_y = 20.0 + (-60.6) + 14.1 = -26.5~\\text{m}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate magnitude of displacement:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`|\\vec{d}| = \\sqrt{d_x^2 + d_y^2}`}</BlockMath>
                        <BlockMath>{`|\\vec{d}| = \\sqrt{(55.5)^2 + (-26.5)^2}`}</BlockMath>
                        <BlockMath>{`|\\vec{d}| = \\sqrt{3080 + 702} = \\sqrt{3782} = 61.5~\\text{m}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Calculate direction of displacement:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`\\theta = \\tan^{-1}\\left(\\frac{d_y}{d_x}\\right)`}</BlockMath>
                        <BlockMath>{`\\theta = \\tan^{-1}\\left(\\frac{-26.5}{55.5}\\right) = \\tan^{-1}(-0.477) = -25.5°`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">This is 25.5° south of east</p>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center mb-2">
                          <span>Displacement: <InlineMath>{`\\vec{d} = 61.5~\\text{m}`}</InlineMath> at 25.5° S of E</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The man ends up 61.5 m from his starting point in a direction 25.5° south of east
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: Vector addition is commutative - the order of adding the vectors doesn't affect the final result</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Whether you add the vectors as d₁ + d₂ + d₃ or in any other order, the resultant displacement vector will be the same
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5: Navigation" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's analyze vectors in a navigation problem involving an airplane and wind.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">An airplane flies at a velocity of 300 km/h due North relative to the air. A wind is blowing at 70 km/h due West.</p>
                <p className="mb-2"><strong>Find:</strong></p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The velocity of the airplane relative to the ground (magnitude and direction)</li>
                  <li>How far off course will the airplane be after flying for 3 hours?</li>
                </ul>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Airplane velocity:</div>
                              <div><InlineMath>{`v_a = 300~\\text{km/h}`}</InlineMath> North</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The velocity of the airplane relative to the air
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Wind velocity:</div>
                              <div><InlineMath>{`v_w = 70~\\text{km/h}`}</InlineMath> West</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The velocity of the wind relative to the ground
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Flight time:</div>
                              <div><InlineMath>{`t = 3~\\text{h}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Total time of flight
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate ground velocity (Part A):</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">For vector addition, we can use components:</p>
                        <p className="mb-1">Airplane flies North: <InlineMath>{`v_{ay} = 300~\\text{km/h}, v_{ax} = 0~\\text{km/h}`}</InlineMath></p>
                        <p className="mb-1">Wind blows West: <InlineMath>{`v_{wx} = -70~\\text{km/h}, v_{wy} = 0~\\text{km/h}`}</InlineMath></p>
                        <p className="mb-1">Ground velocity components:</p>
                        <BlockMath>{`v_{gx} = v_{ax} + v_{wx} = 0 + (-70) = -70~\\text{km/h}`}</BlockMath>
                        <BlockMath>{`v_{gy} = v_{ay} + v_{wy} = 300 + 0 = 300~\\text{km/h}`}</BlockMath>
                        
                        <p className="mb-1">Magnitude of ground velocity:</p>
                        <BlockMath>{`|\\vec{v_g}| = \\sqrt{v_{gx}^2 + v_{gy}^2} = \\sqrt{(-70)^2 + (300)^2}`}</BlockMath>
                        <BlockMath>{`|\\vec{v_g}| = \\sqrt{4,900 + 90,000} = \\sqrt{94,900} = 308~\\text{km/h}`}</BlockMath>
                        
                        <p className="mb-1">Direction of ground velocity:</p>
                        <BlockMath>{`\\theta = \\tan^{-1}\\left(\\frac{|v_{gx}|}{v_{gy}}\\right) = \\tan^{-1}\\left(\\frac{70}{300}\\right) = 13.1°~\\text{W of N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate off-course distance (Part B):</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Off-course means the westward displacement:</p>
                        <BlockMath>{`\\text{Off-course distance} = v_{wx} \\times t = 70~\\text{km/h} \\times 3~\\text{h} = 210~\\text{km}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Final answers:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center mb-2">
                          <span>Part A: The ground velocity is <InlineMath>{`308~\\text{km/h}`}</InlineMath> at <InlineMath>{`13.1°`}</InlineMath> West of North</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Ground velocity is the vector sum of airplane velocity and wind velocity
                            </div>
                          </span>
                        </div>
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>Part B: The airplane will be <InlineMath>{`210~\\text{km}`}</InlineMath> west of its intended path after <InlineMath>{`3~\\text{h}`}</InlineMath></span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              This is the perpendicular distance from the intended northward path
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: Vector addition allows us to determine the actual path of the airplane by combining the airplane's velocity through air with the wind velocity.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          This is a practical application of vector addition in navigation
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            {/* Vector Practice Problems - Knowledge Check */}
            <SlideshowKnowledgeCheck
              courseId={courseId}
              lessonPath="01-physics-20-review"
              course={course}
              onAIAccordionContent={onAIAccordionContent}
              questions={[
                {
                  type: 'multiple-choice',
                  questionId: 'course2_01_physics_20_review_vector_q1',
                  title: 'Question 1: Ski Lift Height'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_01_physics_20_review_vector_q2',
                  title: 'Question 2: Highway Distance and Bearing'
                }
              ]}
              onComplete={(score, results) => console.log(`Vector Knowledge Check completed with ${score}%`)}
              theme="green"
            />

            <AIAccordion.Item value="example6" title="Example 6: Centripetal Acceleration" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving centripetal acceleration and circular motion.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">
                  A car traveling at 20 m/s goes around an unbanked curve in the road which has a radius 
                  of 122 m. What is the acceleration experienced by the car? What provided the 
                  centripetal force?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Speed of the car:</div>
                              <div><InlineMath>{`v = 20~\\text{m/s}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The car's constant speed around the curve
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Radius of the curve:</div>
                              <div><InlineMath>{`r = 122~\\text{m}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The radius of the circular path followed by the car
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Select appropriate equation:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For centripetal acceleration in circular motion:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`a_c = \\frac{v^2}{r}`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          This equation gives us the centripetal acceleration for an object moving in a circular path
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`a_c = \\frac{(20~\\text{m/s})^2}{122~\\text{m}}`}</BlockMath>
                        <BlockMath>{`a_c = \\frac{400~\\text{m}^2\\text{/s}^2}{122~\\text{m}} = 3.28~\\text{m/s}^2 \\approx 3.3~\\text{m/s}^2`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Determine the source of centripetal force:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">For a car on an unbanked curve, the centripetal force is provided by:</p>
                        <p>Static friction between the car's tires and the road surface</p>
                        <p className="text-sm text-gray-600 mt-1">This friction force acts perpendicular to the car's motion, toward the center of the curve</p>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center mb-2">
                          <span>The centripetal acceleration is <InlineMath>{`3.3~\\text{m/s}^2`}</InlineMath> directed toward the center of the curve</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Centripetal acceleration always points toward the center of the circular path
                            </div>
                          </span>
                        </div>
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>The centripetal force is provided by <strong>friction</strong> between the tires and the road surface</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Without this friction, the car would continue in a straight line (Newton's First Law)
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: Even though the car maintains a constant speed, it is still accelerating because the direction of motion is constantly changing.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Acceleration is the rate of change of velocity, and velocity is a vector quantity with both magnitude and direction
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example7" title="Example 7: Centripetal Force" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving centripetal force and tension in circular motion.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">
                  An object of mass 1.8 kg moves in a horizontal circle of radius 0.50 m. 
                  If the period of revolution is 1.2 s, what is the tension in the string?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Mass of object:</div>
                              <div><InlineMath>{`m = 1.8~\\text{kg}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The mass of the object moving in the circular path
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Radius of circular path:</div>
                              <div><InlineMath>{`r = 0.50~\\text{m}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The distance from the center of the circle to the object
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Period of revolution:</div>
                              <div><InlineMath>{`T = 1.2~\\text{s}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Time taken to complete one full revolution
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Select appropriate equation:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For centripetal force using period of revolution:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`F_c = \\frac{4\\pi^2 mr}{T^2}`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          This formula relates centripetal force to the mass, radius, and period of revolution
                        </div>
                      </div>
                      <p className="mt-2 pl-4">For this problem, the tension force provides the centripetal force:</p>
                      <BlockMath>{`F_T = F_c`}</BlockMath>
                    </li>
                    <li>
                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`F_T = \\frac{4\\pi^2 (1.8~\\text{kg})(0.50~\\text{m})}{(1.2~\\text{s})^2}`}</BlockMath>
                        <BlockMath>{`F_T = \\frac{4\\pi^2 (1.8)(0.50)}{1.44}`}</BlockMath>
                        <BlockMath>{`F_T = \\frac{4(9.87)(0.90)}{1.44}`}</BlockMath>
                        <BlockMath>{`F_T = \\frac{35.5}{1.44} = 24.7~\\text{N} \\approx 25~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>The tension in the string is <InlineMath>{`25~\\text{N}`}</InlineMath></span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              This tension force acts toward the center of the circular path and provides the necessary centripetal force to maintain circular motion
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: For an object on a string moving in a horizontal circle, the tension in the string must be greater than the weight of the object.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          If the tension equals the weight, the object would simply hang vertically and not move in a circle
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            {/* Circular Motion Knowledge Check */}
            <SlideshowKnowledgeCheck
              courseId={courseId}
              lessonPath="01-physics-20-review"
              course={course}
              onAIAccordionContent={onAIAccordionContent}
              questions={[
                {
                  type: 'multiple-choice',
                  questionId: 'course2_01_physics_20_review_circular_q1',
                  title: 'Question 1: Ball Speed and Tension'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_01_physics_20_review_circular_q2',
                  title: 'Question 2: Car Cornering Force'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_01_physics_20_review_circular_q3',
                  title: 'Question 3: Satellite Motion'
                }
              ]}
              onComplete={(score, results) => console.log(`Circular Motion Knowledge Check completed with ${score}%`)}
              theme="purple"
            />

            <AIAccordion.Item value="example8" title="Example 8: Multiple Forces" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving multiple forces acting on an object and determine the resulting acceleration.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A 2.0 kg object experiences a 15 N force pulling south, a 25 N force pulling west, and a 
                20 N force pulling at 30° S of E. What is the acceleration experienced by the object?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Mass of object:</div>
                              <div><InlineMath>{`m = 2.0~\\text{kg}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The mass of the object experiencing the forces
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Force 1:</div>
                              <div><InlineMath>{`F_1 = 15~\\text{N}`}</InlineMath> South</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  First force acting in the negative y-direction
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Force 2:</div>
                              <div><InlineMath>{`F_2 = 25~\\text{N}`}</InlineMath> West</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Second force acting in the negative x-direction
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Force 3:</div>
                              <div><InlineMath>{`F_3 = 20~\\text{N}`}</InlineMath> at 30° S of E</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Third force at an angle (30° below the positive x-axis)
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find the components of each force:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Using coordinate system where +x is East and +y is North:</p>
                        <p className="mb-2">Force 1 components (South):</p>
                        <BlockMath>{`F_{1x} = 0~\\text{N}`}</BlockMath>
                        <BlockMath>{`F_{1y} = -15~\\text{N}~\\text{(negative for South)}`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Force 2 components (West):</p>
                        <BlockMath>{`F_{2x} = -25~\\text{N}~\\text{(negative for West)}`}</BlockMath>
                        <BlockMath>{`F_{2y} = 0~\\text{N}`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Force 3 components (30° S of E):</p>
                        <BlockMath>{`F_{3x} = 20\\cos(30°) = 20 \\times 0.866 = 17.3~\\text{N}`}</BlockMath>
                        <BlockMath>{`F_{3y} = -20\\sin(30°) = -20 \\times 0.5 = -10~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate net force:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Sum the components in each direction:</p>
                        <BlockMath>{`F_{\\text{net}x} = F_{1x} + F_{2x} + F_{3x} = 0 + (-25) + 17.3 = -7.7~\\text{N}`}</BlockMath>
                        <BlockMath>{`F_{\\text{net}y} = F_{1y} + F_{2y} + F_{3y} = (-15) + 0 + (-10) = -25~\\text{N}`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Calculate magnitude of net force:</p>
                        <BlockMath>{`F_{\\text{net}} = \\sqrt{F_{\\text{net}x}^2 + F_{\\text{net}y}^2} = \\sqrt{(-7.7)^2 + (-25)^2}`}</BlockMath>
                        <BlockMath>{`F_{\\text{net}} = \\sqrt{59.3 + 625} = \\sqrt{684.3} = 26.2~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply Newton's Second Law:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">Newton's Second Law relates force to mass and acceleration:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`\\vec{a} = \\frac{\\vec{F}_{\\text{net}}}{m}`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          The acceleration vector points in the same direction as the net force vector
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate acceleration components:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">For x-component:</p>
                        <BlockMath>{`a_x = \\frac{F_{\\text{net}x}}{m} = \\frac{-7.7~\\text{N}}{2.0~\\text{kg}} = -3.9~\\text{m/s}^2~\\text{(West)}`}</BlockMath>
                        
                        <p className="mb-2">For y-component:</p>
                        <BlockMath>{`a_y = \\frac{F_{\\text{net}y}}{m} = \\frac{-25~\\text{N}}{2.0~\\text{kg}} = -12.5~\\text{m/s}^2~\\text{(South)}`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Magnitude of acceleration:</p>
                        <BlockMath>{`a = \\sqrt{a_x^2 + a_y^2} = \\sqrt{(-3.9)^2 + (-12.5)^2}`}</BlockMath>
                        <BlockMath>{`a = \\sqrt{15.2 + 156.3} = \\sqrt{171.5} = 13.1~\\text{m/s}^2`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Direction of acceleration:</p>
                        <BlockMath>{`\\theta = \\tan^{-1}\\left(\\frac{|a_y|}{|a_x|}\\right) = \\tan^{-1}\\left(\\frac{12.5}{3.9}\\right) = \\tan^{-1}(3.2) = 73°`}</BlockMath>
                        <p className="text-sm text-gray-600 mt-1">Since both x and y components are negative, the direction is 73° South of West</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Final answer:</strong>
                      <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                        <span>The acceleration of the object is <InlineMath>{`13.1~\\text{m/s}^2`}</InlineMath> in the direction 73° South of West</span>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            The acceleration is directly proportional to the net force and inversely proportional to the mass
                          </div>
                        </span>
                      </p>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: When multiple forces act on an object, the resulting acceleration is determined by the net force. The direction of this acceleration will be identical to the direction of the net force.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Newton's Second Law states that F = ma, which means the acceleration vector is always parallel to the net force vector
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example9" title="Example 9: Upward Acceleration" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving upward acceleration where we need to consider both the applied force and gravity.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">What is the force required to accelerate a 50 kg object upward at 2.0 m/s²?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Mass of object:</div>
                              <div><InlineMath>{`m = 50~\\text{kg}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The mass of the object being accelerated
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Desired acceleration:</div>
                              <div><InlineMath>{`a = 2.0~\\text{m/s}^2`}</InlineMath> upward</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The net upward acceleration we want to achieve
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Acceleration due to gravity:</div>
                              <div><InlineMath>{`g = 9.81~\\text{m/s}^2`}</InlineMath> downward</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Gravity acts downward on all objects near Earth's surface
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate the weight of the object:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">The weight is the gravitational force acting downward:</p>
                        <BlockMath>{`W = mg = (50~\\text{kg})(9.81~\\text{m/s}^2) = 490.5~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply Newton's Second Law:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For motion in the vertical direction:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`\\sum F_y = ma_y`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          The net force in the y-direction equals mass times acceleration in the y-direction
                        </div>
                      </div>
                      <p className="mt-2 pl-4">With upward as positive:</p>
                      <BlockMath>{`F - mg = ma`}</BlockMath>
                      <p className="text-sm text-gray-600 mt-1 pl-4">Where F is the applied force (upward), mg is the weight (downward)</p>
                    </li>
                    
                    <li>
                      <strong>Solve for the applied force:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`F = ma + mg = m(a + g)`}</BlockMath>
                        <BlockMath>{`F = 50~\\text{kg} \\times (2.0 + 9.81)~\\text{m/s}^2`}</BlockMath>
                        <BlockMath>{`F = 50~\\text{kg} \\times 11.81~\\text{m/s}^2`}</BlockMath>
                        <BlockMath>{`F = 590.5~\\text{N} \\approx 590~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>The required applied force is <InlineMath>{`590~\\text{N}`}</InlineMath> upward</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              This force must overcome both the object's weight (490 N) and provide the additional force needed for upward acceleration (100 N)
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: When accelerating an object upward, the applied force must be greater than the object's weight. The difference between the applied force and weight provides the net upward force for acceleration.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          If F = mg exactly, the object would have zero acceleration (constant velocity or at rest). If F &gt; mg, there's upward acceleration.
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example10" title="Example 10: Force and Friction" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving applied force, friction, and acceleration on a horizontal surface.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A force of 90 N is applied to a wagon (mass 40 kg) at an angle of 30° to the horizontal. If the frictional force is 27.94 N, what is the resulting acceleration of the wagon?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Mass of wagon:</div>
                              <div><InlineMath>{`m = 40~\\text{kg}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The mass of the wagon being pulled
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Applied force:</div>
                              <div><InlineMath>{`F = 90~\\text{N}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The magnitude of the force applied to the wagon
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Angle of applied force:</div>
                              <div><InlineMath>{`\\theta = 30°`}</InlineMath> to horizontal</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The angle above the horizontal at which the force is applied
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Frictional force:</div>
                              <div><InlineMath>{`f = 27.94~\\text{N}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The friction force opposing the motion
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Resolve the applied force into components:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Horizontal component (contributes to acceleration):</p>
                        <BlockMath>{`F_x = F \\cos(30°) = 90 \\times \\cos(30°) = 90 \\times 0.866 = 77.94~\\text{N}`}</BlockMath>
                        
                        <p className="mb-2 mt-3">Vertical component (affects normal force):</p>
                        <BlockMath>{`F_y = F \\sin(30°) = 90 \\times \\sin(30°) = 90 \\times 0.5 = 45~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply Newton's Second Law in the horizontal direction:</strong>
                      <div className="pl-4 mt-2 group relative cursor-help">
                        <p className="border-b border-dotted border-blue-300 inline-block">For motion in the horizontal direction:</p>
                        <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                        <BlockMath>{`\\sum F_x = ma_x`}</BlockMath>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                          The net horizontal force equals mass times horizontal acceleration
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate net horizontal force:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-2">Net force = Applied horizontal force - Friction force:</p>
                        <BlockMath>{`F_{\\text{net}} = F_x - f = 77.94~\\text{N} - 27.94~\\text{N} = 50.0~\\text{N}`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate acceleration:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`a = \\frac{F_{\\text{net}}}{m} = \\frac{50.0~\\text{N}}{40~\\text{kg}} = 1.25~\\text{m/s}^2`}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Final answer:</strong>
                      <div className="pl-4 mt-1">
                        <div className="group relative cursor-help inline-flex items-center">
                          <span>The resulting acceleration of the wagon is <InlineMath>{`1.25~\\text{m/s}^2`}</InlineMath> in the direction of the applied force</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The acceleration is positive, indicating the wagon accelerates in the direction of the horizontal component of the applied force
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                      <span>Note: When a force is applied at an angle, only the component parallel to the direction of motion contributes to acceleration. The perpendicular component affects other forces (like normal force) but doesn't directly cause acceleration in the direction of motion.</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          This is a fundamental principle in physics: forces must be resolved into components when analyzing motion in specific directions.
                        </div>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example11" title="Example 11: Kinetic Friction" onAskAI={onAIAccordionContent}>
              <p className="mb-4">
                Let's solve a problem involving kinetic friction when an object moves at constant velocity.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A 10 kg box is dragged over a horizontal surface by a force of 40 N. If the box moves with a constant speed of 0.50 m/s, what is the coefficient of kinetic friction for the surface?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify known values:</strong>
                      <div className="pl-4 mt-2 space-y-4">
                        <div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Mass of box:</div>
                              <div><InlineMath>{`m = 10~\\text{kg}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The mass of the box being dragged
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Applied force:</div>
                              <div><InlineMath>{`F = 40~\\text{N}`}</InlineMath></div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  The horizontal force applied to drag the box
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Velocity:</div>
                              <div><InlineMath>{`v = 0.50~\\text{m/s}`}</InlineMath> (constant)</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  Constant velocity means acceleration = 0
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Apply Newton's First Law:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Since the box moves at constant velocity, the net force is zero (Newton's First Law)</p>
                      </div>
                    </li>
                      
                    <li>
                      <strong>Set up force equilibrium equations:</strong>
                      <div className="pl-4 mt-2 space-y-3">
                        <div className="group relative cursor-help">
                          <p className="mb-2">
                            <strong>Horizontal forces:</strong> <InlineMath>{`\\sum F_x = 0`}</InlineMath>
                          </p>
                          <p className="mb-2"><InlineMath>{`F - f = 0`}</InlineMath></p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Applied force equals friction force for equilibrium
                            </div>
                          </span>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="mb-2">
                            <strong>Vertical forces:</strong> <InlineMath>{`\\sum F_y = 0`}</InlineMath>
                          </p>
                          <p className="mb-2"><InlineMath>{`N - mg = 0`}</InlineMath></p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Normal force equals weight for equilibrium
                            </div>
                          </span>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find the normal force:</strong>
                      <div className="pl-4 mt-2">
                        <p><InlineMath>{`N = mg = (10~\\text{kg})(9.8~\\text{m/s}^2) = 98~\\text{N}`}</InlineMath></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Use the kinetic friction equation:</strong>
                      <div className="pl-4 mt-2 space-y-3">
                        <div className="group relative cursor-help">
                          <p className="mb-2">The kinetic friction force is given by:</p>
                          <p className="mb-2"><InlineMath>{`f = \\mu_k N`}</InlineMath></p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              μₖ is the coefficient of kinetic friction we need to find
                            </div>
                          </span>
                        </div>
                        
                        <p>From the horizontal equilibrium: <InlineMath>{`f = F = 40~\\text{N}`}</InlineMath></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Solve for the coefficient of kinetic friction:</strong>
                      <div className="pl-4 mt-2 space-y-3">
                        <p><InlineMath>{`\\mu_k = \\frac{f}{N} = \\frac{40~\\text{N}}{98~\\text{N}} = 0.41`}</InlineMath></p>
                        
                        <p className="font-medium">
                          <strong>Answer:</strong> The coefficient of kinetic friction is <InlineMath>{`\\mu_k = 0.41`}</InlineMath>
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        // Fallback to manual accordion if AIAccordion not available
        <div className="my-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600">AIAccordion component not available. Please check the implementation.</p>
        </div>
      )}

      {/* Dynamics Practice Knowledge Check */}
      <TextSection>
        <div className="my-8">
          <SlideshowKnowledgeCheck
            courseId={courseId}
            lessonPath="01-physics-20-review"
            course={course}
            onAIAccordionContent={onAIAccordionContent}
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q1',
                title: 'Question 1: Net Force and Acceleration'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q2',
                title: 'Question 2: Friction Force'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q3',
                title: 'Question 3: Inclined Plane'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q4',
                title: 'Question 4: Tension in Rope'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q5',
                title: 'Question 5: Coefficient of Friction'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q6',
                title: 'Question 6: Normal Force'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q7',
                title: 'Question 7: Vector Acceleration'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q8',
                title: 'Question 8: Elevator (Apparent Weight)'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_01_physics_20_review_dynamics_q9',
                title: 'Question 9: Static Friction'
              }
            ]}
            onComplete={(score, results) => console.log(`Dynamics Knowledge Check completed with score: ${score}%`)}
            theme="blue"
          />
        </div>
      </TextSection>




      <LessonSummary
        title="Key Skills for Physics 30"
        points={[
            "Problem-Solving Framework: Follow a systematic approach - identify knowns/unknowns, draw appropriate diagrams, select correct equations, perform algebraic manipulation, and validate answers with proper significant figures and units",
            "Vector Operations: Decompose vectors into components using trigonometry, perform vector addition/subtraction, and apply these skills to displacement, velocity, and force problems in two dimensions"
          ]}
        />
    </LessonContent>
  );
};

export default Physics20Review;