import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { DynamicQuestion } from '../../../../components/assessments';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Introduction to Physics lesson component
 */
const IntroToPhysics = ({ course, courseId = '2' }) => {
  const { currentUser } = useAuth();  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);  const [isExample3Open, setIsExample3Open] = useState(false);  const [isExample4Open, setIsExample4Open] = useState(false);  const [isExample5Open, setIsExample5Open] = useState(false);  const [isExample6Open, setIsExample6Open] = useState(false);  const [isExample7Open, setIsExample7Open] = useState(false);  const [isExample8Open, setIsExample8Open] = useState(false);  const [isExample9Open, setIsExample9Open] = useState(false);
  const [isExample10Open, setIsExample10Open] = useState(false);
  const [isExample11Open, setIsExample11Open] = useState(false);  const [currentProblem, setCurrentProblem] = useState(0);
  const [currentVectorProblem, setCurrentVectorProblem] = useState(0);
  const [currentCircularProblem, setCurrentCircularProblem] = useState(0);
  const [currentDynamicsProblem, setCurrentDynamicsProblem] = useState(0);
  
  // Assessment ID for the dynamic question
  const dynamicQuestionId = 'q1_physics_calculation';
  
  // Get courseId from the course object - check different possible formats
  const effectiveCourseId = String(course?.CourseID || course?.courseId || course?.id || courseId || 'PHY30');
  
  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();
  
  console.log("🏫 Using courseId:", effectiveCourseId);

  // Log course and currentUser to help with debugging
  useEffect(() => {
    console.log("🔍 COURSE OBJECT:", course);
    console.log("🔑 CURRENT USER:", currentUser);
    console.log("📊 COURSE ID:", effectiveCourseId);

    // Check if functions are available
    if (functions) {
      console.log("✅ Firebase Functions available");
    } else {
      console.error("❌ Firebase Functions not available");
    }

    // Check if database is available
    if (db) {
      console.log("✅ Firebase Database available");
    } else {
      console.error("❌ Firebase Database not available");
    }
  }, [course, currentUser, effectiveCourseId]);
  useEffect(() => {
    if (!currentUser) {
      console.error("❌ No authenticated user found");
      setError("You must be logged in to view this lesson");
      setLoading(false);
      return;
    }

    if (!course) {
      console.error("❌ No course data provided");
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    if (!currentUser.email) {
      console.error("❌ User has no email");
      setError("User email is required");
      setLoading(false);
      return;
    }

    // The DynamicQuestion component handles its own database interactions
    setLoading(false);
    console.log("✅ IntroToPhysics component initialized successfully");  }, [course, currentUser]);
  
  // Debug props check in render function
  console.log("🏃‍♂️ Rendering IntroToPhysics component with:", {
    course,
    courseId: effectiveCourseId,
    currentUser,
    assessmentIds: {
      dynamicQuestionId
    },
    loading,    error
  });

  // Practice problems data
  const practiceProblems = [
    {
      id: 1,
      question: "A car accelerates from rest at 3.0 m/s² for 8.0 seconds. What is the final velocity?",
      given: ["Initial velocity: v₀ = 0 m/s", "Acceleration: a = 3.0 m/s²", "Time: t = 8.0 s"],
      equation: "v = v₀ + at",
      solution: "v = 0 + (3.0)(8.0) = 24 m/s",
      answer: "24 m/s"
    },
    {
      id: 2,
      question: "How far does an object travel if it moves at a constant velocity of 15 m/s for 4.0 seconds?",
      given: ["Velocity: v = 15 m/s", "Time: t = 4.0 s"],
      equation: "d = vt",
      solution: "d = (15)(4.0) = 60 m",
      answer: "60 m"
    },
    {
      id: 3,
      question: "A ball is dropped from rest and falls for 3.0 seconds. How far does it fall?",
      given: ["Initial velocity: v₀ = 0 m/s", "Time: t = 3.0 s", "Acceleration: g = 9.81 m/s²"],
      equation: "d = v₀t + ½gt²",
      solution: "d = 0 + ½(9.81)(3.0)² = ½(9.81)(9.0) = 44 m",
      answer: "44 m"
    },
    {
      id: 4,
      question: "What is the acceleration of a car that goes from 0 to 30 m/s in 6.0 seconds?",
      given: ["Initial velocity: v₀ = 0 m/s", "Final velocity: v = 30 m/s", "Time: t = 6.0 s"],
      equation: "a = (v - v₀)/t",
      solution: "a = (30 - 0)/6.0 = 5.0 m/s²",
      answer: "5.0 m/s²"
    },
    {
      id: 5,
      question: "A projectile is launched horizontally at 20 m/s from a height of 45 m. How long does it take to hit the ground?",
      given: ["Height: h = 45 m", "Initial vertical velocity: v₀y = 0 m/s", "Acceleration: g = 9.81 m/s²"],
      equation: "h = v₀yt + ½gt²",
      solution: "45 = 0 + ½(9.81)t² → t = √(90/9.81) = 3.0 s",
      answer: "3.0 s"
    },
    {
      id: 6,
      question: "How fast is an object moving after falling 20 m from rest?",
      given: ["Distance: d = 20 m", "Initial velocity: v₀ = 0 m/s", "Acceleration: g = 9.81 m/s²"],
      equation: "v² = v₀² + 2gd",
      solution: "v² = 0 + 2(9.81)(20) = 392.4 → v = 20 m/s",
      answer: "20 m/s"
    },
    {
      id: 7,
      question: "A car traveling at 25 m/s brakes with an acceleration of -5.0 m/s². How long does it take to stop?",
      given: ["Initial velocity: v₀ = 25 m/s", "Final velocity: v = 0 m/s", "Acceleration: a = -5.0 m/s²"],
      equation: "v = v₀ + at",
      solution: "0 = 25 + (-5.0)t → t = 25/5.0 = 5.0 s",
      answer: "5.0 s"
    },
    {
      id: 8,
      question: "What distance does the car in problem 7 travel while braking?",
      given: ["Initial velocity: v₀ = 25 m/s", "Final velocity: v = 0 m/s", "Acceleration: a = -5.0 m/s²"],
      equation: "v² = v₀² + 2ad",
      solution: "0² = 25² + 2(-5.0)d → d = 625/10 = 63 m",
      answer: "63 m"
    },
    {
      id: 9,
      question: "A ball is thrown upward with an initial velocity of 15 m/s. What is the maximum height reached?",
      given: ["Initial velocity: v₀ = 15 m/s", "Final velocity at max height: v = 0 m/s", "Acceleration: g = -9.81 m/s²"],
      equation: "v² = v₀² + 2gd",
      solution: "0² = 15² + 2(-9.81)d → d = 225/19.62 = 11 m",
      answer: "11 m"
    },
    {
      id: 10,
      question: "How long does it take for the ball in problem 9 to reach maximum height?",
      given: ["Initial velocity: v₀ = 15 m/s", "Final velocity: v = 0 m/s", "Acceleration: g = -9.81 m/s²"],
      equation: "v = v₀ + gt",
      solution: "0 = 15 + (-9.81)t → t = 15/9.81 = 1.5 s",
      answer: "1.5 s"
    },
    {
      id: 11,
      question: "A cyclist accelerates from 5.0 m/s to 12 m/s over a distance of 50 m. What is the acceleration?",
      given: ["Initial velocity: v₀ = 5.0 m/s", "Final velocity: v = 12 m/s", "Distance: d = 50 m"],
      equation: "v² = v₀² + 2ad",
      solution: "12² = 5.0² + 2a(50) → a = (144-25)/100 = 1.2 m/s²",
      answer: "1.2 m/s²"
    },
    {
      id: 12,
      question: "A stone is thrown horizontally from a cliff 80 m high with a speed of 12 m/s. How far from the base of the cliff does it land?",
      given: ["Height: h = 80 m", "Horizontal velocity: vₓ = 12 m/s", "Acceleration: g = 9.81 m/s²"],
      equation: "h = ½gt² and d = vₓt",
      solution: "t = √(2h/g) = √(160/9.81) = 4.0 s, then d = 12(4.0) = 48 m",
      answer: "48 m"
    },
    {
      id: 13,
      question: "An object moves with constant acceleration from 8.0 m/s to 20 m/s in 4.0 seconds. How far does it travel?",
      given: ["Initial velocity: v₀ = 8.0 m/s", "Final velocity: v = 20 m/s", "Time: t = 4.0 s"],
      equation: "d = (v₀ + v)t/2",
      solution: "d = (8.0 + 20)(4.0)/2 = 28(2.0) = 56 m",
      answer: "56 m"    }
  ];

  // Vectors practice problems data
  const vectorPracticeProblems = [
    {
      id: 1,
      question: "A displacement vector has components 25 m East and 15 m North. What is the magnitude of the resultant displacement?",
      given: ["East component: dx = 25 m", "North component: dy = 15 m"],
      equation: "d = \\sqrt{d_x^2 + d_y^2}",
      solution: "d = \\sqrt{25^2 + 15^2} = \\sqrt{625 + 225} = \\sqrt{850} = 29 m",
      answer: "29 m"
    },
    {
      id: 2,
      question: "A force vector of 50 N acts at an angle of 30° above the horizontal. What are the horizontal and vertical components?",
      given: ["Force magnitude: F = 50 N", "Angle: θ = 30°"],
      equation: "F_x = F\\cos(θ), \\quad F_y = F\\sin(θ)",
      solution: "F_x = 50\\cos(30°) = 50(0.866) = 43 N, \\quad F_y = 50\\sin(30°) = 50(0.5) = 25 N",
      answer: "Fx = 43 N, Fy = 25 N"
    },
    {
      id: 3,
      question: "Two vectors A = 12 m at 45° and B = 8 m at 90° are added. What is the magnitude of the resultant?",
      given: ["Vector A: 12 m at 45°", "Vector B: 8 m at 90°"],
      equation: "R = \\sqrt{R_x^2 + R_y^2}",
      solution: "A_x = 12\\cos(45°) = 8.5 m, A_y = 12\\sin(45°) = 8.5 m, B_x = 0, B_y = 8 m, R_x = 8.5 m, R_y = 16.5 m, R = \\sqrt{8.5^2 + 16.5^2} = 19 m",
      answer: "19 m"
    },
    {
      id: 4,
      question: "A velocity vector has components 40 m/s East and 30 m/s South. What is the direction of this velocity?",
      given: ["East component: vx = 40 m/s", "South component: vy = -30 m/s"],
      equation: "θ = \\tan^{-1}\\left(\\frac{|v_y|}{|v_x|}\\right)",
      solution: "θ = \\tan^{-1}\\left(\\frac{30}{40}\\right) = \\tan^{-1}(0.75) = 37° \\text{ South of East}",
      answer: "37° South of East"
    },
    {
      id: 5,
      question: "Three forces act on an object: 20 N North, 15 N East, and 10 N South. What is the net force?",
      given: ["Force 1: 20 N North", "Force 2: 15 N East", "Force 3: 10 N South"],
      equation: "F_{net} = \\sqrt{F_x^2 + F_y^2}",
      solution: "F_x = 15 N, F_y = 20 - 10 = 10 N, F_{net} = \\sqrt{15^2 + 10^2} = \\sqrt{325} = 18 N",
      answer: "18 N"
    },
    {
      id: 6,
      question: "A projectile has an initial velocity of 25 m/s at 60° above horizontal. What are the horizontal and vertical components?",
      given: ["Initial velocity: v₀ = 25 m/s", "Launch angle: θ = 60°"],
      equation: "v_{0x} = v_0\\cos(θ), \\quad v_{0y} = v_0\\sin(θ)",
      solution: "v_{0x} = 25\\cos(60°) = 25(0.5) = 13 m/s, \\quad v_{0y} = 25\\sin(60°) = 25(0.866) = 22 m/s",
      answer: "v₀x = 13 m/s, v₀y = 22 m/s"
    },
    {
      id: 7,
      question: "Two perpendicular vectors have magnitudes 8 units and 6 units. What is the angle between the resultant and the 8-unit vector?",
      given: ["Vector A: 8 units", "Vector B: 6 units", "Angle between A and B: 90°"],
      equation: "θ = \\tan^{-1}\\left(\\frac{B}{A}\\right)",
      solution: "θ = \\tan^{-1}\\left(\\frac{6}{8}\\right) = \\tan^{-1}(0.75) = 37°",
      answer: "37°"    }
  ];

  // Circular motion practice problems data
  const circularPracticeProblems = [
    {
      id: 1,
      question: "A car traveling at 20 m/s goes around a curve with radius 50 m. What is the centripetal acceleration?",
      given: ["Velocity: v = 20 m/s", "Radius: r = 50 m"],
      equation: "a_c = \\frac{v^2}{r}",
      solution: "a_c = \\frac{(20)^2}{50} = \\frac{400}{50} = 8.0 \\text{ m/s}^2",
      answer: "8.0 m/s²"
    },
    {
      id: 2,
      question: "A satellite orbits Earth at an altitude where the centripetal acceleration is 9.2 m/s². If the orbital radius is 6.7 × 10⁶ m, what is the orbital speed?",
      given: ["Centripetal acceleration: ac = 9.2 m/s²", "Orbital radius: r = 6.7 × 10⁶ m"],
      equation: "v = \\sqrt{a_c \\cdot r}",
      solution: "v = \\sqrt{9.2 \\times 6.7 \\times 10^6} = \\sqrt{6.164 \\times 10^7} = 7850 \\text{ m/s}",
      answer: "7850 m/s"
    },
    {
      id: 3,
      question: "A 2.0 kg object moves in a horizontal circle of radius 1.5 m with a period of 3.0 s. What is the centripetal force?",
      given: ["Mass: m = 2.0 kg", "Radius: r = 1.5 m", "Period: T = 3.0 s"],
      equation: "F_c = \\frac{4\\pi^2 mr}{T^2}",
      solution: "F_c = \\frac{4\\pi^2 (2.0)(1.5)}{(3.0)^2} = \\frac{4\\pi^2 (3.0)}{9.0} = \\frac{4\\pi^2}{3.0} = 13 \\text{ N}",      answer: "13 N"
    }
  ];
  // Dynamics practice problems data
  const dynamicsPracticeProblems = [
    {
      id: 1,
      question: "A 5.0 kg object experiences a net force of 15 N. What is its acceleration?",
      given: ["Mass: m = 5.0 kg", "Net force: F = 15 N"],
      equation: "F = ma",
      solution: "a = \\frac{F}{m} = \\frac{15 \\text{ N}}{5.0 \\text{ kg}} = 3.0 \\text{ m/s}^2",
      answer: "3.0 m/s²"
    },
    {
      id: 2,
      question: "A 2.0 kg block is pulled across a horizontal surface with a force of 20 N. If the coefficient of kinetic friction is 0.25, what is the acceleration?",
      given: ["Mass: m = 2.0 kg", "Applied force: F = 20 N", "Coefficient of kinetic friction: μₖ = 0.25"],
      equation: "F_{net} = F - f = F - \\mu_k mg",
      solution: "F_{net} = 20 - (0.25)(2.0)(9.8) = 20 - 4.9 = 15.1 \\text{ N}\\\\a = \\frac{F_{net}}{m} = \\frac{15.1}{2.0} = 7.6 \\text{ m/s}^2",
      answer: "7.6 m/s²"
    },
    {
      id: 3,
      question: "Two forces act on a 3.0 kg object: 25 N East and 15 N North. What is the magnitude of acceleration?",
      given: ["Mass: m = 3.0 kg", "Force 1: F₁ = 25 N East", "Force 2: F₂ = 15 N North"],
      equation: "F_{net} = \\sqrt{F_1^2 + F_2^2}",
      solution: "F_{net} = \\sqrt{(25)^2 + (15)^2} = \\sqrt{625 + 225} = \\sqrt{850} = 29.2 \\text{ N}\\\\a = \\frac{F_{net}}{m} = \\frac{29.2}{3.0} = 9.7 \\text{ m/s}^2",
      answer: "9.7 m/s²"
    },
    {
      id: 4,
      question: "A 1.5 kg object hangs from a rope. What is the tension in the rope when the object is at rest?",
      given: ["Mass: m = 1.5 kg", "Acceleration: a = 0 m/s² (at rest)"],
      equation: "T = mg",
      solution: "T = (1.5 \\text{ kg})(9.8 \\text{ m/s}^2) = 14.7 \\text{ N}",
      answer: "14.7 N"
    },
    {
      id: 5,
      question: "A 4.0 kg object is pulled up a frictionless incline of 30° with a force of 25 N parallel to the incline. What is the acceleration?",
      given: ["Mass: m = 4.0 kg", "Applied force: F = 25 N", "Incline angle: θ = 30°"],
      equation: "F_{net} = F - mg\\sin(θ)",
      solution: "F_{net} = 25 - (4.0)(9.8)\\sin(30°) = 25 - 19.6 = 5.4 \\text{ N}\\\\a = \\frac{F_{net}}{m} = \\frac{5.4}{4.0} = 1.4 \\text{ m/s}^2",
      answer: "1.4 m/s²"
    },
    {
      id: 6,
      question: "What force is required to accelerate a 12 kg object at 2.5 m/s²?",
      given: ["Mass: m = 12 kg", "Acceleration: a = 2.5 m/s²"],
      equation: "F = ma",
      solution: "F = (12 \\text{ kg})(2.5 \\text{ m/s}^2) = 30 \\text{ N}",
      answer: "30 N"
    },
    {
      id: 7,
      question: "A 0.8 kg object is attached to a horizontal spring. If the spring force is 16 N and friction is negligible, what is the acceleration?",
      given: ["Mass: m = 0.8 kg", "Spring force: F = 16 N"],
      equation: "F = ma",
      solution: "a = \\frac{F}{m} = \\frac{16 \\text{ N}}{0.8 \\text{ kg}} = 20 \\text{ m/s}^2",
      answer: "20 m/s²"
    },
    {
      id: 8,
      question: "A 6.0 kg block slides down a frictionless incline of 45°. What is its acceleration down the incline?",
      given: ["Mass: m = 6.0 kg", "Incline angle: θ = 45°", "No friction"],
      equation: "a = g\\sin(θ)",
      solution: "a = (9.8 \\text{ m/s}^2)\\sin(45°) = (9.8)(0.707) = 6.9 \\text{ m/s}^2",
      answer: "6.9 m/s²"
    },
    {
      id: 9,
      question: "Two objects are connected by a rope over a pulley: 3.0 kg hangs vertically and 2.0 kg is on a horizontal frictionless surface. What is the acceleration of the system?",
      given: ["Mass 1: m₁ = 3.0 kg (hanging)", "Mass 2: m₂ = 2.0 kg (horizontal)", "No friction"],
      equation: "a = \\frac{m_1 g}{m_1 + m_2}",
      solution: "a = \\frac{(3.0)(9.8)}{3.0 + 2.0} = \\frac{29.4}{5.0} = 5.9 \\text{ m/s}^2",
      answer: "5.9 m/s²"
    }
  ];

  const nextProblem = () => {
    setCurrentProblem((prev) => (prev + 1) % practiceProblems.length);
  };

  const prevProblem = () => {
    setCurrentProblem((prev) => (prev - 1 + practiceProblems.length) % practiceProblems.length);
  };

  const goToProblem = (index) => {
    setCurrentProblem(index);
  };

  const nextVectorProblem = () => {
    setCurrentVectorProblem((prev) => (prev + 1) % vectorPracticeProblems.length);
  };

  const prevVectorProblem = () => {
    setCurrentVectorProblem((prev) => (prev - 1 + vectorPracticeProblems.length) % vectorPracticeProblems.length);
  };  const goToVectorProblem = (index) => {
    setCurrentVectorProblem(index);
  };

  const nextCircularProblem = () => {
    setCurrentCircularProblem((prev) => (prev + 1) % circularPracticeProblems.length);
  };

  const prevCircularProblem = () => {
    setCurrentCircularProblem((prev) => (prev - 1 + circularPracticeProblems.length) % circularPracticeProblems.length);
  };
  const goToCircularProblem = (index) => {
    setCurrentCircularProblem(index);
  };

  const nextDynamicsProblem = () => {
    setCurrentDynamicsProblem((prev) => (prev + 1) % dynamicsPracticeProblems.length);
  };

  const prevDynamicsProblem = () => {
    setCurrentDynamicsProblem((prev) => (prev - 1 + dynamicsPracticeProblems.length) % dynamicsPracticeProblems.length);
  };

  const goToDynamicsProblem = (index) => {
    setCurrentDynamicsProblem(index);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (<LessonContent
      lessonId="lesson_1747281754691_113"
      title="Physics 20 Review"
      metadata={{ estimated_time: '120 minutes' }}
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
                    </li>                    <li>
                      <strong>Substitute values:</strong>
                      <div className="pl-4 mt-2">
                        <BlockMath>{`d = (20~\\text{m/s})(5.0~\\text{s}) + \\frac{1}{2}(9.81~\\text{m/s}^2)(5.0~\\text{s})^2`}</BlockMath>
                        <BlockMath>{`d = 100~\\text{m} + \\frac{1}{2}(9.81)(25)~\\text{m}`}</BlockMath>
                        <BlockMath>{`d = 100~\\text{m} + 122.625~\\text{m} = 222.625~\\text{m}`}</BlockMath>
                      </div>
                    </li><li>                      <strong>Final answer:</strong>
                      <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                        <span>The building is <InlineMath>{`2.2 \\times 10^2~\\text{m}`}</InlineMath> tall</span>
                        <span className="ml-1 text-blue-500 text-xs relative">
                          ⓘ
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                            This is equivalent to a ~72-story building!
                          </div>                        </span>
                      </p>
                    </li>                  </ol></div>
              </div>
            </div>          )}        </div>

        {/* Practice Problems - Slideshow */}
        <div className="mt-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-green-900">Kinematics Practice Problems</h3>
          <p className="mb-6 text-gray-700">
            Work through these practice problems to test your understanding. Use the navigation arrows or 
            click on the problem numbers to jump to specific problems.
          </p>
          
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">            {/* Problem Counter */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-green-800 font-medium">
                Problem {currentProblem + 1} of {practiceProblems.length}
              </div>
              <div className="flex space-x-1">
                {practiceProblems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToProblem(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-200 ${
                      index === currentProblem
                        ? 'bg-green-800 text-white'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Content */}
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4">
                {practiceProblems[currentProblem].question}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Given and Equation */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Given:</h5>
                    <ul className="space-y-1">
                      {practiceProblems[currentProblem].given.map((item, index) => (
                        <li key={index} className="text-sm bg-green-50 px-3 py-1 rounded border-l-3 border-green-300">
                          <InlineMath>{item}</InlineMath>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Equation:</h5>
                    <div className="bg-green-100 px-4 py-3 rounded border border-green-200">
                      <BlockMath>{practiceProblems[currentProblem].equation}</BlockMath>
                    </div>
                  </div>
                </div>

                {/* Right Column - Solution */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Solution:</h5>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-sm">
                      <InlineMath>{practiceProblems[currentProblem].solution}</InlineMath>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Answer:</h5>
                    <div className="bg-green-600 text-white px-4 py-3 rounded font-medium text-center">
                      <InlineMath>{`\\text{${practiceProblems[currentProblem].answer}}`}</InlineMath>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={practiceProblems.length <= 1}
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <div className="text-green-700 font-medium">
                {currentProblem + 1} / {practiceProblems.length}
              </div>
              
              <button
                onClick={nextProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={practiceProblems.length <= 1}
              >
                Next
                <span className="ml-2">→</span>
              </button>            </div>
          </div>
        </div>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample3Open(!isExample3Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 3: Vector Components</h3>
            <span className="text-blue-600">{isExample3Open ? '▼' : '▶'}</span>
          </button>

          {isExample3Open && (
            <div className="mt-4">
              <p className="mb-4">
                Let's analyze the components of a velocity vector using trigonometry.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">What are the components of a plane flying at 500 km/h at 60° N of W?</p>
                
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
                                  The magnitude (speed) of the velocity vector
                                </div>
                              </span>
                            </div>
                          </div>
                          <div className="group relative cursor-help mb-2">
                            <div className="flex items-baseline">
                              <div className="w-48">Direction:</div>
                              <div><InlineMath>{`\\theta = 60°`}</InlineMath> N of W</div>
                              <span className="ml-1 text-blue-500 text-xs relative">
                                ⓘ
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                  60° north of west means 60° counterclockwise from the negative x-axis
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>                    <li>
                      <strong>Draw a vector diagram:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Set up coordinate system with positive x-axis pointing East, positive y-axis pointing North</p>
                        
                        {/* Vector Diagram */}
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-4 flex justify-center">                          <svg viewBox="0 0 340 260" className="w-full max-w-lg mx-auto border border-gray-300 bg-gray-50">
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
                            
                            {/* Vector components with enhanced visibility */}                            {/* x-component (westward) - horizontal dashed line */}
                            <line x1="170" y1="170" x2="90" y2="170" stroke="#2563eb" strokeWidth="2" strokeDasharray="6,3" />
                            <text x="125" y="185" fontSize="9" fill="#2563eb" fontWeight="bold">vₓ</text>
                            
                            {/* y-component (northward) - vertical dashed line */}
                            <line x1="90" y1="170" x2="90" y2="90" stroke="#059669" strokeWidth="2" strokeDasharray="6,3" />
                            <text x="75" y="135" fontSize="9" fill="#059669" fontWeight="bold">vᵧ</text>                            {/* Angle arc - showing 60° from negative x-axis, moved left and down */}
                            <path d="M 150 170 A 20 20 0 0 1 158 154" stroke="#f59e0b" strokeWidth="2" fill="none" />
                            <text x="130" y="158" fontSize="9" fill="#f59e0b" fontWeight="bold">60°</text>                            {/* Vector label - positioned above the vector */}
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
                    <li>                      <strong>Final answer:</strong>
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
            </div>          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample4Open(!isExample4Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 4: Vector Addition - Displacement</h3>
            <span className="text-blue-600">{isExample4Open ? '▼' : '▶'}</span>
          </button>

          {isExample4Open && (
            <div className="mt-4">
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
                      <div className="pl-4 mt-1">                        <div className="group relative cursor-help inline-flex items-center mb-2">
                          <span>Displacement: <InlineMath>{`\\vec{d} = 61.5~\\text{m}`}</InlineMath> at 25.5° S of E</span>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The man ends up 61.5 m from his starting point in a direction 25.5° south of east. Alternative notation: 64.5° E of S (since 90° - 25.5° = 64.5°)
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
            </div>          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample5Open(!isExample5Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 5: Vectors in Navigation - Airplane and Wind</h3>
            <span className="text-blue-600">{isExample5Open ? '▼' : '▶'}</span>
          </button>
            {isExample5Open && (
            <div className="mt-4">
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
                  
                  {/* Vector Diagram */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-4 flex justify-center relative">
                    <svg viewBox="0 0 350 300" className="w-full max-w-lg mx-auto border border-gray-100 bg-gray-50">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Origin */}
                      <circle cx="175" cy="250" r="3" fill="black" />
                      <text x="180" y="265" fontSize="12" fill="black">O</text>
                      
                      {/* Airplane velocity vector (North - up) */}
                      <line x1="175" y1="250" x2="175" y2="100" stroke="blue" strokeWidth="3" markerEnd="url(#arrowhead-blue)" />
                      <text x="180" y="170" fontSize="14" fill="blue" fontWeight="bold">
                        <tspan className="hover-tooltip" data-tooltip="Airplane velocity relative to air: 300 km/h North">
                          v<tspan fontSize="10" dy="2">a</tspan> = 300 km/h
                        </tspan>
                      </text>
                      <text x="180" y="185" fontSize="12" fill="blue">(North)</text>
                      
                      {/* Wind velocity vector (West - left, starting from tip of airplane vector) */}
                      <line x1="175" y1="100" x2="105" y2="100" stroke="red" strokeWidth="3" markerEnd="url(#arrowhead-red)" />
                      <text x="110" y="90" fontSize="14" fill="red" fontWeight="bold">
                        <tspan className="hover-tooltip" data-tooltip="Wind velocity: 70 km/h West">
                          v<tspan fontSize="10" dy="2">w</tspan> = 70 km/h
                        </tspan>
                      </text>
                      <text x="120" y="115" fontSize="12" fill="red">(West)</text>
                      
                      {/* Resultant velocity vector (ground velocity) */}
                      <line x1="175" y1="250" x2="105" y2="100" stroke="green" strokeWidth="3" markerEnd="url(#arrowhead-green)" strokeDasharray="5,5" />
                      <text x="125" y="125" fontSize="14" fill="green" fontWeight="bold">
                        <tspan className="hover-tooltip" data-tooltip="Ground velocity: resultant of airplane and wind vectors">
                          v<tspan fontSize="10" dy="2">g</tspan>
                        </tspan>
                      </text>
                      
                      {/* Angle measurement arc - from blue vector (North) to green vector (resultant) */}
                      <path d="M 175 230 A 15 15 0 0 0 160 215" fill="none" stroke="purple" strokeWidth="2" />
                      <text x="160" y="210" fontSize="12" fill="purple" fontWeight="bold">
                        <tspan className="hover-tooltip" data-tooltip="Angle θ = tan^(-1)(70/300) = 13.1° W of N">
                          θ
                        </tspan>
                      </text>
                      
                      {/* Coordinate system labels */}
                      <text x="185" y="100" fontSize="12" fill="black" fontWeight="bold">N</text>
                      <text x="100" y="245" fontSize="12" fill="black" fontWeight="bold">W</text>
                      <text x="185" y="290" fontSize="12" fill="black" fontWeight="bold">S</text>
                      <text x="260" y="245" fontSize="12" fill="black" fontWeight="bold">E</text>
                      
                      {/* Arrow markers */}
                      <defs>
                        <marker id="arrowhead-blue" markerWidth="6" markerHeight="4" refX="5.5" refY="2" orient="auto">
                          <polygon points="0 0, 6 2, 0 4" fill="blue" />
                        </marker>
                        <marker id="arrowhead-red" markerWidth="6" markerHeight="4" refX="5.5" refY="2" orient="auto">
                          <polygon points="0 0, 6 2, 0 4" fill="red" />
                        </marker>
                        <marker id="arrowhead-green" markerWidth="6" markerHeight="4" refX="5.5" refY="2" orient="auto">
                          <polygon points="0 0, 6 2, 0 4" fill="green" />
                        </marker>
                      </defs>
                    </svg>
                    
                    <div className="absolute top-2 left-2 text-sm bg-white p-2 rounded border border-gray-200">
                      <div><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Airplane velocity (air)</div>
                      <div><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> Wind velocity</div>
                      <div><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Ground velocity (resultant)</div>
                    </div>
                  </div>
                  
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
            </div>
          )}        </div>
      </TextSection>

      {/* Vector Practice Problems - Slideshow */}
      <TextSection>
        <div className="mt-8 mb-6">          <h3 className="text-xl font-semibold mb-4 text-green-900">Vector Practice Problems</h3>
          
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            {/* Problem Counter */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-green-800 font-medium">
                Problem {currentVectorProblem + 1} of {vectorPracticeProblems.length}
              </div>
              <div className="flex space-x-1">
                {vectorPracticeProblems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToVectorProblem(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-200 ${
                      index === currentVectorProblem
                        ? 'bg-green-800 text-white'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Content */}
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4">
                {vectorPracticeProblems[currentVectorProblem].question}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Given and Equation */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Given:</h5>
                    <ul className="space-y-1">
                      {vectorPracticeProblems[currentVectorProblem].given.map((item, index) => (
                        <li key={index} className="text-sm bg-green-50 px-3 py-1 rounded border-l-3 border-green-300">
                          <InlineMath>{item}</InlineMath>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Equation:</h5>
                    <div className="bg-green-100 px-4 py-3 rounded border border-green-200">
                      <BlockMath>{vectorPracticeProblems[currentVectorProblem].equation}</BlockMath>
                    </div>
                  </div>
                </div>

                {/* Right Column - Solution */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Solution:</h5>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-sm">
                      <InlineMath>{vectorPracticeProblems[currentVectorProblem].solution}</InlineMath>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Answer:</h5>
                    <div className="bg-green-600 text-white px-4 py-3 rounded font-medium text-center">
                      <InlineMath>{`\\text{${vectorPracticeProblems[currentVectorProblem].answer}}`}</InlineMath>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevVectorProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={vectorPracticeProblems.length <= 1}
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <div className="text-green-700 font-medium">
                {currentVectorProblem + 1} / {vectorPracticeProblems.length}
              </div>
              
              <button
                onClick={nextVectorProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={vectorPracticeProblems.length <= 1}
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
            onClick={() => setIsExample6Open(!isExample6Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 6: Centripetal Acceleration</h3>
            <span className="text-blue-600">{isExample6Open ? '▼' : '▶'}</span>
          </button>          {isExample6Open && (
            <div className="mt-4">
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
            </div>
          )}</div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample7Open(!isExample7Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 7: Centripetal Force and Tension</h3>
            <span className="text-blue-600">{isExample7Open ? '▼' : '▶'}</span>
          </button>          {isExample7Open && (
            <div className="mt-4">
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
            </div>
          )}        </div>

        {/* Circular Motion Practice Problems - Slideshow */}
        <div className="mt-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-green-900">Circular Motion Practice Problems</h3>
          
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            {/* Problem Counter */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-green-800 font-medium">
                Problem {currentCircularProblem + 1} of {circularPracticeProblems.length}
              </div>
              <div className="flex space-x-1">
                {circularPracticeProblems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCircularProblem(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-200 ${
                      index === currentCircularProblem
                        ? 'bg-green-800 text-white'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Content */}
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4">
                {circularPracticeProblems[currentCircularProblem].question}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Given and Equation */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Given:</h5>
                    <ul className="space-y-1">
                      {circularPracticeProblems[currentCircularProblem].given.map((item, index) => (
                        <li key={index} className="text-sm bg-green-50 px-3 py-1 rounded border-l-3 border-green-300">
                          <InlineMath>{item}</InlineMath>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Equation:</h5>
                    <div className="bg-green-100 px-4 py-3 rounded border border-green-200">
                      <BlockMath>{circularPracticeProblems[currentCircularProblem].equation}</BlockMath>
                    </div>
                  </div>
                </div>

                {/* Right Column - Solution */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Solution:</h5>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-sm">
                      <InlineMath>{circularPracticeProblems[currentCircularProblem].solution}</InlineMath>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Answer:</h5>
                    <div className="bg-green-600 text-white px-4 py-3 rounded font-medium text-center">
                      <InlineMath>{`\\text{${circularPracticeProblems[currentCircularProblem].answer}}`}</InlineMath>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevCircularProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={circularPracticeProblems.length <= 1}
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <div className="text-green-700 font-medium">
                {currentCircularProblem + 1} / {circularPracticeProblems.length}
              </div>
              
              <button
                onClick={nextCircularProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={circularPracticeProblems.length <= 1}
              >
                Next
                <span className="ml-2">→</span>
              </button>            </div>
          </div>
        </div>
      </TextSection>
      
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample8Open(!isExample8Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 8: Multiple Forces and Net Force</h3>
            <span className="text-blue-600">{isExample8Open ? '▼' : '▶'}</span>
          </button>
            {isExample8Open && (
            <div className="mt-4">
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
                      <strong>Draw a free-body diagram:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Set up coordinate system with positive x-axis pointing East, positive y-axis pointing North</p>
                        
                        {/* Vector Diagram */}
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-4 flex justify-center">
                          <svg viewBox="0 0 340 300" className="w-full max-w-lg mx-auto">
                            {/* Coordinate axes */}
                            <defs>
                              <marker id="arrowhead-black" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#374151" />
                              </marker>
                              <marker id="arrowhead-red" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#ef4444" />
                              </marker>
                              <marker id="arrowhead-blue" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#3b82f6" />
                              </marker>
                              <marker id="arrowhead-green" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#10b981" />
                              </marker>
                              <marker id="arrowhead-purple" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                                <polygon points="0 0, 5 1.75, 0 3.5" fill="#8b5cf6" />
                              </marker>
                            </defs>                              {/* X-axis (East-West) */}
                            <line x1="40" y1="150" x2="300" y2="150" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowhead-black)" />
                            <text x="290" y="140" fontSize="12" fill="#374151">East</text>
                            <text x="45" y="140" fontSize="12" fill="#374151">West</text>
                            
                            {/* Y-axis (North-South) */}
                            <line x1="170" y1="280" x2="170" y2="40" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowhead-black)" />
                            <text x="175" y="50" fontSize="12" fill="#374151">North</text>
                            <text x="175" y="275" fontSize="12" fill="#374151">South</text>
                            
                            {/* Force 1: 15 N South */}
                            <line x1="170" y1="150" x2="170" y2="220" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead-red)" />
                            <text x="175" y="200" fontSize="12" fill="#ef4444" fontWeight="bold">F₁ = 15 N</text>
                            <text x="175" y="215" fontSize="10" fill="#ef4444">(South)</text>
                              {/* Force 2: 25 N West */}
                            <line x1="170" y1="150" x2="80" y2="150" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowhead-blue)" />
                            <text x="100" y="125" fontSize="12" fill="#3b82f6" fontWeight="bold">F₂ = 25 N</text>
                            <text x="105" y="140" fontSize="10" fill="#3b82f6">(West)</text>                              {/* Force 3: 20 N at 30° S of E */}
                            <line x1="170" y1="150" x2="237" y2="200" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green)" />
                            <text x="250" y="170" fontSize="12" fill="#10b981" fontWeight="bold">F₃ = 20 N</text>
                            <text x="245" y="185" fontSize="10" fill="#10b981">(30° S of E)</text>                            {/* Angle indicator for Force 3 */}
                            <path d="M 200 150 A 25 25 0 0 1 194 165" stroke="#10b981" strokeWidth="2" fill="none" />
                            <text x="205" y="170" fontSize="10" fill="#10b981">30°</text>
                            
                            {/* Origin point and object - moved to be drawn last so it appears on top */}
                            <circle cx="170" cy="150" r="20" fill="#f3f4f6" stroke="#374151" strokeWidth="2" />
                            <text x="160" y="155" fontSize="14" fill="#374151" fontWeight="bold">2kg</text>
                          </svg>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="border-b border-dotted border-blue-300 inline-block text-sm text-gray-600">
                            The diagram shows all forces acting on the 2.0 kg object
                          </p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              In a free-body diagram, we show all forces acting on an object as vectors starting from a single point
                            </div>
                          </span>
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
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample9Open(!isExample9Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 9: Upward Acceleration and Forces</h3>
            <span className="text-blue-600">{isExample9Open ? '▼' : '▶'}</span>
          </button>
          {isExample9Open && (
            <div className="mt-4">
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
                      <strong>Draw a free-body diagram:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Set up coordinate system with positive direction upward</p>
                        
                        {/* Free Body Diagram */}
                        <div className="flex justify-center mb-4">
                          <svg width="300" height="250" viewBox="0 0 300 250" className="border border-gray-300 bg-white rounded">
                            {/* Arrowhead definitions */}                            <defs>                              <marker id="arrowhead-red-9" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#ef4444" />
                              </marker>
                              <marker id="arrowhead-blue-9" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#3b82f6" />
                              </marker>
                            </defs>
                            
                            {/* Coordinate axes */}
                            <line x1="40" y1="200" x2="260" y2="200" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowhead-gray)" />
                            <line x1="150" y1="220" x2="150" y2="40" stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrowhead-gray)" />
                            <text x="265" y="205" fontSize="12" fill="#374151">x</text>
                            <text x="155" y="35" fontSize="12" fill="#374151">y (+)</text>
                            
                            {/* Applied Force (upward) */}
                            <line x1="150" y1="125" x2="150" y2="60" stroke="#3b82f6" strokeWidth="4" markerEnd="url(#arrowhead-blue-9)" />
                            <text x="155" y="85" fontSize="14" fill="#3b82f6" fontWeight="bold">F = ?</text>
                            <text x="155" y="100" fontSize="10" fill="#3b82f6">(Applied Force)</text>
                            
                            {/* Weight Force (downward) */}
                            <line x1="150" y1="125" x2="150" y2="190" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrowhead-red-9)" />
                            <text x="155" y="165" fontSize="14" fill="#ef4444" fontWeight="bold">mg = 490 N</text>
                            <text x="155" y="180" fontSize="10" fill="#ef4444">(Weight)</text>
                            
                            {/* Object */}
                            <circle cx="150" cy="125" r="20" fill="#f3f4f6" stroke="#374151" strokeWidth="2" />
                            <text x="135" y="130" fontSize="12" fill="#374151" fontWeight="bold">50kg</text>
                          </svg>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="border-b border-dotted border-blue-300 inline-block text-sm text-gray-600">
                            The diagram shows the applied force (upward) and weight (downward) acting on the object
                          </p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              For upward acceleration, the applied force must be greater than the weight of the object
                            </div>
                          </span>
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
            </div>
          )}        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample10Open(!isExample10Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 10: Force and Friction with Acceleration</h3>
            <span className="text-blue-600">{isExample10Open ? '▼' : '▶'}</span>
          </button>
          {isExample10Open && (
            <div className="mt-4">
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
                      <strong>Draw a free-body diagram:</strong>
                      <div className="pl-4 mt-2">
                        <p className="mb-4">Set up coordinate system with positive x-axis pointing in the direction of motion</p>
                        
                        {/* Free Body Diagram */}
                        <div className="flex justify-center mb-4">
                          <svg width="400" height="300" viewBox="0 0 400 300" className="border border-gray-300 bg-white rounded">
                            <defs>
                              <marker id="arrowhead-red-10" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#ef4444" />
                              </marker>
                              <marker id="arrowhead-blue-10" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#3b82f6" />
                              </marker>
                              <marker id="arrowhead-green-10" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#10b981" />
                              </marker>
                              <marker id="arrowhead-purple-10" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#8b5cf6" />
                              </marker>
                            </defs>                            {/* Ground/Surface */}
                            <line x1="50" y1="200" x2="350" y2="200" stroke="#374151" strokeWidth="3" />
                            <text x="210" y="220" fontSize="12" fill="#374151" fontWeight="bold">Ground</text>
                              {/* Applied Force F at 30° */}
                            <line x1="200" y1="180" x2="290" y2="135" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead-red-10)" />
                            <text x="295" y="125" fontSize="12" fill="#ef4444" fontWeight="bold">F = 90 N</text>                              {/* Horizontal component Fx */}
                            <line x1="200" y1="180" x2="290" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-red-10)" />
                            <text x="240" y="195" fontSize="10" fill="#ef4444">Fx</text>
                            
                            {/* Vertical component Fy */}
                            <line x1="290" y1="180" x2="290" y2="135" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-red-10)" />
                            <text x="295" y="160" fontSize="10" fill="#ef4444">Fy</text>                            {/* Angle indicator */}
                            <path d="M 245 180 A 30 30 0 0 0 235 165" stroke="#ef4444" strokeWidth="1.5" fill="none" />
                            <text x="246" y="174" fontSize="10" fill="#ef4444">30°</text>
                            
                            {/* Normal Force N (upward) - extended down */}
                            <line x1="200" y1="170" x2="200" y2="90" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowhead-blue-10)" />
                            <text x="205" y="85" fontSize="12" fill="#3b82f6" fontWeight="bold">N</text>
                            
                            {/* Weight W (downward) - extended up */}
                            <line x1="200" y1="190" x2="200" y2="260" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green-10)" />
                            <text x="205" y="275" fontSize="12" fill="#10b981" fontWeight="bold">W = mg</text>
                              {/* Friction f (opposing motion) */}
                            <line x1="200" y1="180" x2="120" y2="180" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead-purple-10)" />
                            <text x="85" y="175" fontSize="12" fill="#8b5cf6" fontWeight="bold">f = 27.94 N</text>
                            <text x="100" y="190" fontSize="10" fill="#8b5cf6">(friction)</text>
                              {/* Wagon (center) - drawn last to appear on top */}
                            <rect x="180" y="165" width="40" height="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2" rx="3"/>
                            <text x="185" y="185" fontSize="12" fill="#374151" fontWeight="bold">40 kg</text>
                          </svg>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="border-b border-dotted border-blue-300 inline-block text-sm text-gray-600">
                            The diagram shows all forces acting on the wagon
                          </p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              The applied force has both horizontal and vertical components. Only the horizontal component contributes to horizontal acceleration.
                            </div>
                          </span>
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
            </div>          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample11Open(!isExample11Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 11: Kinetic Friction with Constant Velocity</h3>
            <span className="text-blue-600">{isExample11Open ? '▼' : '▶'}</span>
          </button>
          {isExample11Open && (
            <div className="mt-4">
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
                        
                        {/* Free Body Diagram */}
                        <div className="flex justify-center mb-4">
                          <svg width="350" height="250" viewBox="0 0 350 250" className="border border-gray-300 bg-white rounded">
                            <defs>
                              <marker id="arrowhead-red-11" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#ef4444" />
                              </marker>
                              <marker id="arrowhead-blue-11" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#3b82f6" />
                              </marker>
                              <marker id="arrowhead-green-11" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#10b981" />
                              </marker>
                              <marker id="arrowhead-purple-11" markerWidth="3" markerHeight="2" refX="2.5" refY="1" orient="auto">
                                <polygon points="0 0, 3 1, 0 2" fill="#8b5cf6" />
                              </marker>
                            </defs>
                            
                            {/* Ground/Surface */}
                            <line x1="50" y1="170" x2="300" y2="170" stroke="#374151" strokeWidth="3" />
                            <text x="160" y="190" fontSize="12" fill="#374151" fontWeight="bold">Surface</text>
                            
                            {/* Applied Force F (horizontal right) */}
                            <line x1="175" y1="150" x2="245" y2="150" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead-red-11)" />
                            <text x="250" y="145" fontSize="12" fill="#ef4444" fontWeight="bold">F = 40 N</text>
                            
                            {/* Normal Force N (upward) */}
                            <line x1="175" y1="150" x2="175" y2="80" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrowhead-blue-11)" />
                            <text x="180" y="75" fontSize="12" fill="#3b82f6" fontWeight="bold">N</text>
                            
                            {/* Weight W (downward) */}
                            <line x1="175" y1="150" x2="175" y2="220" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green-11)" />
                            <text x="180" y="235" fontSize="12" fill="#10b981" fontWeight="bold">W = mg</text>
                            
                            {/* Friction f (horizontal left) */}
                            <line x1="175" y1="150" x2="105" y2="150" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#arrowhead-purple-11)" />
                            <text x="65" y="145" fontSize="12" fill="#8b5cf6" fontWeight="bold">f</text>
                            <text x="80" y="160" fontSize="10" fill="#8b5cf6">(friction)</text>
                            
                            {/* Box (center) */}
                            <rect x="155" y="135" width="40" height="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2" rx="3"/>
                            <text x="160" y="155" fontSize="12" fill="#374151" fontWeight="bold">10 kg</text>
                          </svg>
                        </div>
                        
                        <div className="group relative cursor-help">
                          <p className="border-b border-dotted border-blue-300 inline-block text-sm text-gray-600">
                            At constant velocity, all forces are balanced
                          </p>
                          <span className="ml-1 text-blue-500 text-xs relative">
                            ⓘ
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                              Since acceleration = 0, the net force in each direction must equal zero
                            </div>
                          </span>
                        </div>
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
            </div>
          )}        </div>
      </TextSection>

      {/* Dynamics Practice Problems - Slideshow */}
      <TextSection>
        <div className="mt-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-green-900">Dynamics Practice Problems</h3>
          
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            {/* Problem Counter */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-green-800 font-medium">
                Problem {currentDynamicsProblem + 1} of {dynamicsPracticeProblems.length}
              </div>
              <div className="flex space-x-1">
                {dynamicsPracticeProblems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToDynamicsProblem(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-200 ${
                      index === currentDynamicsProblem
                        ? 'bg-green-800 text-white'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Content */}
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4">
                {dynamicsPracticeProblems[currentDynamicsProblem].question}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Given and Equation */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Given:</h5>
                    <ul className="space-y-1">
                      {dynamicsPracticeProblems[currentDynamicsProblem].given.map((item, index) => (
                        <li key={index} className="text-sm bg-green-50 px-3 py-1 rounded border-l-3 border-green-300">
                          <InlineMath>{item}</InlineMath>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Equation:</h5>
                    <div className="bg-green-100 px-4 py-3 rounded border border-green-200">
                      <BlockMath>{dynamicsPracticeProblems[currentDynamicsProblem].equation}</BlockMath>
                    </div>
                  </div>
                </div>

                {/* Right Column - Solution */}
                <div>
                  <div className="mb-4">
                    <h5 className="font-medium text-green-700 mb-2">Solution:</h5>
                    <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-sm">
                      <InlineMath>{dynamicsPracticeProblems[currentDynamicsProblem].solution}</InlineMath>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Answer:</h5>
                    <div className="bg-green-600 text-white px-4 py-3 rounded font-medium text-center">
                      <InlineMath>{`\\text{${dynamicsPracticeProblems[currentDynamicsProblem].answer}}`}</InlineMath>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevDynamicsProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={dynamicsPracticeProblems.length <= 1}
              >
                <span className="mr-2">←</span>
                Previous
              </button>
              
              <div className="text-green-700 font-medium">
                {currentDynamicsProblem + 1} / {dynamicsPracticeProblems.length}
              </div>
              
              <button
                onClick={nextDynamicsProblem}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={dynamicsPracticeProblems.length <= 1}
              >
                Next
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      </TextSection>        <LessonSummary
        title="Key Skills for Physics 30"
        points={[
            "Problem-Solving Framework: Follow a systematic approach - identify knowns/unknowns, draw appropriate diagrams, select correct equations, perform algebraic manipulation, and validate answers with proper significant figures and units",
            "Vector Operations: Decompose vectors into components using trigonometry, perform vector addition/subtraction, and apply these skills to displacement, velocity, and force problems in two dimensions"
          ]}
        />
      </TextSection>
    </LessonContent>
  );
};

export default IntroToPhysics;
