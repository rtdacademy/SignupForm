import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Introduction to Physics lesson component
 */
const IntroToPhysics = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    if (!course) {
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [course, currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }  return (    <LessonContent
      lessonId="lesson_1747281754691_113"
      title="Physics 20 Review"
      metadata={{ estimated_time: '45 minutes' }}
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
        </ul>      </TextSection>
      
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1: Free Fall Motion</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
              <p className="mb-4">
                Let's solve a problem involving free fall motion, using our understanding of kinematics equations.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">How fast will an object be travelling after falling for 7.0 s?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>                      <strong>Identify known values:</strong>
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
                    <li>                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`v = 0~\\text{m/s} + (-9.81~\\text{m/s}^2)(7.0~\\text{s})`}</BlockMath>
                        <BlockMath>{`v = -68.67~\\text{m/s}~\\text{(exact calculation)}`}</BlockMath>
                        <BlockMath>{`v = -69~\\text{m/s}~\\text{(rounded to 2 significant figures)}`}</BlockMath>
                      </div>
                    </li>
                    <li>                      <strong>Final answer:</strong>
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
            </div>
          )}
        </div>      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample2Open(!isExample2Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 2: Initial Velocity and Displacement</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
              <p className="mb-4">
                Let's solve a problem involving initial velocity and displacement using kinematics equations.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">A man standing on the roof of a building throws a stone downward at 20 m/s and the stone hits the ground after 5.0 s. How tall is the building?</p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  <ol className="list-decimal pl-6 space-y-3">                    <li>                      <strong>Identify known values:</strong>
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
                        <BlockMath>{`d = 100~\\text{m} + 122.625~\\text{m} = 222.625~\\text{m}~\\text{(exact calculation)}`}</BlockMath>
                        <BlockMath>{`d = 220~\\text{m}~\\text{(rounded to 2 significant figures)}`}</BlockMath>
                      </div>
                    </li>                    <li>                      <strong>Final answer:</strong>
                      <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                        <span>The building is <InlineMath>{`2.2 \\times 10^2~\\text{m}`}</InlineMath> tall</span>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            This is equivalent to a ~72-story building!
                          </div>                        </span>
                      </p>
                    </li>
                  </ol></div>
              </div>
            </div>          )}
        </div>

        <LessonSummary
        points={[
            "Review of kinematics equations and their applications",
            "Understanding motion in one and two dimensions",
            "Problem-solving strategies for physics problems",
            "Using mathematical tools to analyze physical situations"
          ]}
        />
      </TextSection>
    </LessonContent>
  );
};

export default IntroToPhysics;
