import React, { useState, useEffect, useRef } from 'react';
// TEMPORARY FIX: Commented out to avoid Firebase permission errors
// import { useAuth } from '../../../../../context/AuthContext';
// import { getFunctions } from 'firebase/functions';
// import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import { MultipleChoiceQuestion, DynamicQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Animated collision component showing two balls colliding with momentum vectors
 */
const CollisionAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('before'); // 'before', 'collision', 'after'
  
  // Ball control states
  const [ball1Mass, setBall1Mass] = useState(3);
  const [ball1Velocity, setBall1Velocity] = useState(2);
  const [ball2Mass, setBall2Mass] = useState(2);
  const [ball2Velocity, setBall2Velocity] = useState(-1);
  
  // Ball properties
  const ball1 = useRef({
    x: 100,
    y: 150,
    vx: 2,
    vy: 0,
    radius: 20,
    mass: 3,
    color: '#3B82F6', // blue
    originalX: 100,
    originalVx: 2
  });
  
  const ball2 = useRef({
    x: 400,
    y: 150,
    vx: -1,
    vy: 0,
    radius: 15,
    mass: 2,
    color: '#EF4444', // red
    originalX: 400,
    originalVx: -1
  });
    const time = useRef(0);
  const collisionTime = useRef(null);
  const endPauseTime = useRef(null);
    // Update ball properties when sliders change
  const updateBallProperties = () => {
    // Update ball 1
    ball1.current.mass = ball1Mass;
    ball1.current.originalVx = ball1Velocity;
    ball1.current.radius = Math.max(10, Math.min(30, 10 + ball1Mass * 3)); // Scale radius with mass
    
    // Update ball 2
    ball2.current.mass = ball2Mass;
    ball2.current.originalVx = ball2Velocity;
    ball2.current.radius = Math.max(10, Math.min(30, 10 + ball2Mass * 3)); // Scale radius with mass
    
    // Reset positions and velocities if not currently playing
    if (!isPlaying) {
      resetAnimation();
    }
  };

  // Calculate collision outcome using conservation of momentum and energy
  const calculateCollision = () => {
    const m1 = ball1.current.mass;
    const m2 = ball2.current.mass;
    const u1 = ball1.current.originalVx;
    const u2 = ball2.current.originalVx;
    
    // Elastic collision in 1D
    const v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2);
    const v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2);
    
    return { v1, v2 };
  };
  const resetAnimation = () => {
    // Stop animation
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Reset balls to initial positions
    ball1.current.x = ball1.current.originalX;
    ball1.current.vx = ball1.current.originalVx;
    ball2.current.x = ball2.current.originalX;    ball2.current.vx = ball2.current.originalVx;
    
    time.current = 0;
    collisionTime.current = null;
    endPauseTime.current = null;
    setPhase('before');
    
    // Redraw the canvas
    animate();
  };const drawBall = (ctx, ball, phase) => {
    // Set high DPI scaling for crisp text
    const dpr = window.devicePixelRatio || 1;
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Only draw momentum vector if not during collision
    if (phase !== 'collision') {
      // Draw momentum vector
      const vectorScale = 20;
      const vectorLength = Math.abs(ball.vx) * vectorScale;
      const vectorX = ball.x + (ball.vx > 0 ? ball.radius + 10 : -ball.radius - 10);
      const vectorY = ball.y;
      const arrowX = vectorX + (ball.vx > 0 ? vectorLength : -vectorLength);
      
      // Draw vector arrow
      ctx.beginPath();
      ctx.moveTo(vectorX, vectorY);
      ctx.lineTo(arrowX, vectorY);
      ctx.strokeStyle = ball.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw arrowhead
      const arrowSize = 8;
      const arrowDirection = ball.vx > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(arrowX, vectorY);
      ctx.lineTo(arrowX - arrowDirection * arrowSize, vectorY - arrowSize);
      ctx.moveTo(arrowX, vectorY);
      ctx.lineTo(arrowX - arrowDirection * arrowSize, vectorY + arrowSize);
      ctx.stroke();
  
    }
    
    // Ball labels with enhanced rendering
    ctx.save();
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(ball === ball1.current ? 'm₁' : 'm₂', ball.x, ball.y);
    ctx.restore();
  };
    const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Draw background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    
    // Draw center line
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(displayWidth / 2, 0);
    ctx.lineTo(displayWidth / 2, displayHeight);
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();
    ctx.setLineDash([]);
    
    const b1 = ball1.current;
    const b2 = ball2.current;    // Update positions (only if not during collision)
    if (phase !== 'collision') {
      b1.x += b1.vx;
      b2.x += b2.vx;
    }
    
    // Check for collision
    const distance = Math.abs(b1.x - b2.x);
    const collisionDistance = b1.radius + b2.radius;
    
    if (distance <= collisionDistance && !collisionTime.current && phase === 'before') {
      collisionTime.current = time.current;
      setPhase('collision');
      
      // Position balls at collision point (touching but not overlapping)
      const centerPoint = (b1.x + b2.x) / 2;
      b1.x = centerPoint - b1.radius;
      b2.x = centerPoint + b2.radius;
      
      // Stop balls completely during collision by setting velocities to 0
      b1.vx = 0;
      b2.vx = 0;
      
      // Calculate post-collision velocities
      const { v1, v2 } = calculateCollision();
      
      setTimeout(() => {
        b1.vx = v1;
        b2.vx = v2;
        setPhase('after');
      }, 500); // Show collision phase for 500ms
    }
      // Draw balls
    drawBall(ctx, b1, phase);
    drawBall(ctx, b2, phase);
    
    // Draw fixed momentum labels (only if not during collision)
    if (phase !== 'collision') {
      ctx.save();
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better contrast
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Fixed position momentum labels with units
      const momentum1 = (b1.mass * b1.vx).toFixed(1);
      const momentum2 = (b2.mass * b2.vx).toFixed(1);
      
      const label1 = phase === 'after' ? 
        `m₁v₁' = ${momentum1} kg⋅m/s` : 
        `m₁v₁ = ${momentum1} kg⋅m/s`;
      const label2 = phase === 'after' ? 
        `m₂v₂' = ${momentum2} kg⋅m/s` : 
        `m₂v₂ = ${momentum2} kg⋅m/s`;
        // Position labels in fixed locations
      ctx.fillStyle = '#3B82F6'; // Blue for ball 1
      ctx.fillText(label1, 20, 60);
      
      // Position ball 2 label on the right side
      ctx.fillStyle = '#EF4444'; // Red for ball 2
      ctx.textAlign = 'right';
      ctx.fillText(label2, displayWidth - 20, 60);
      
      ctx.restore();
    }
    
    // Draw phase label with crisp text
    ctx.save();
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const phaseText = phase === 'before' ? 'Before Collision' : 
                     phase === 'collision' ? 'During Collision' : 'After Collision';
    ctx.fillText(phaseText, displayWidth / 2, 30);
    ctx.restore();
    
    // Show total momentum with crisp text
    ctx.save();
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const totalMomentum = (b1.mass * b1.vx + b2.mass * b2.vx).toFixed(1);
    ctx.fillText(`Total Momentum = ${totalMomentum} kg⋅m/s`, displayWidth / 2, displayHeight - 20);
    ctx.restore();
      time.current += 1;      // Continue animation if playing and balls are still in view
    if (isPlaying && animationRef.current && (b1.x > -50 && b1.x < displayWidth + 50 && b2.x > -50 && b2.x < displayWidth + 50)) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (b1.x < -50 || b1.x > displayWidth + 50 || b2.x < -50 || b2.x > displayWidth + 50) {
      // Balls have moved off screen - start end pause before reset
      if (!endPauseTime.current) {
        endPauseTime.current = time.current;
      }
      
      // Wait 5 seconds (300 frames at 60fps) before resetting
      if (time.current - endPauseTime.current < 300) {
        // Continue animation during pause (balls are off screen but timer continues)
        if (isPlaying && animationRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        }
      } else {
        // Pause time has elapsed - reset to initial state
        setIsPlaying(false);
        animationRef.current = null;
        
        // Reset balls to initial positions and velocities
        ball1.current.x = ball1.current.originalX;
        ball1.current.vx = ball1.current.originalVx;
        ball2.current.x = ball2.current.originalX;
        ball2.current.vx = ball2.current.originalVx;
        
        // Reset simulation state
        time.current = 0;
        collisionTime.current = null;
        endPauseTime.current = null;
        setPhase('before');
        
        // Redraw the canvas with reset state
        animate();
      }
    }
  };  const startAnimation = () => {
    // Update ball properties from sliders
    updateBallProperties();
    
    // Reset balls to initial positions and velocities for new animation
    ball1.current.x = ball1.current.originalX;
    ball1.current.vx = ball1.current.originalVx;
    ball2.current.x = ball2.current.originalX;
    ball2.current.vx = ball2.current.originalVx;    
    time.current = 0;
    collisionTime.current = null;
    endPauseTime.current = null;
    setPhase('before');
    setIsPlaying(true);
  };
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, phase]);

  // Update ball properties when slider values change
  useEffect(() => {
    updateBallProperties();
  }, [ball1Mass, ball1Velocity, ball2Mass, ball2Velocity]);
  // Setup high DPI canvas and initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const setupCanvas = () => {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Set actual size in memory (scaled to account for extra pixel density)
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;
      
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      // Scale the canvas back down using CSS
      canvas.style.width = displayWidth + 'px';
      canvas.style.height = displayHeight + 'px';
      
      // Scale the drawing context so everything will work at the higher resolution
      ctx.scale(dpr, dpr);
      
      // Update ball positions based on canvas width
      const ball1StartX = displayWidth * 0.2; // 20% from left
      const ball2StartX = displayWidth * 0.8; // 80% from left
      const ballY = displayHeight / 2; // Center vertically
      
      ball1.current.originalX = ball1StartX;
      ball1.current.x = ball1StartX;
      ball1.current.y = ballY;
      
      ball2.current.originalX = ball2StartX;
      ball2.current.x = ball2StartX;
      ball2.current.y = ballY;
      
      animate();
    };
    
    // Initial setup
    setupCanvas();
    
    // Handle resize
    const handleResize = () => {
      if (!isPlaying) {
        setupCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);    return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Interactive Controls */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* Ball Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h6 className="font-medium text-blue-800 text-sm">Ball 1 (Blue)</h6>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Mass: {ball1Mass} kg
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={ball1Mass}
                onChange={(e) => setBall1Mass(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 kg</span>
                <span>6 kg</span>
              </div>
            </div>            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Velocity: {ball1Velocity > 0 ? '+' : ''}{ball1Velocity} m/s {ball1Velocity >= 0 ? '(right)' : '(left)'}
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={ball1Velocity}
                onChange={(e) => setBall1Velocity(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>+0.5 m/s</span>
                <span>+5 m/s</span>
              </div>
            </div>
          </div>

          {/* Ball 2 Controls */}
          <div className="space-y-2">
            <h6 className="font-medium text-red-800 text-sm">Ball 2 (Red)</h6>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Mass: {ball2Mass} kg
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={ball2Mass}
                onChange={(e) => setBall2Mass(parseFloat(e.target.value))}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 kg</span>
                <span>6 kg</span>
              </div>
            </div>            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Velocity: {ball2Velocity > 0 ? '+' : ''}{ball2Velocity} m/s {ball2Velocity >= 0 ? '(right)' : '(left)'}
              </label>
              <input
                type="range"
                min="-5"
                max="-0.5"
                step="0.5"
                value={ball2Velocity}
                onChange={(e) => setBall2Velocity(parseFloat(e.target.value))}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-5 m/s</span>
                <span>-0.5 m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Canvas Animation */}
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded mb-4 w-full"
        style={{ 
          height: '200px', 
          display: 'block',
          imageRendering: 'auto'
        }}
      />      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">        <button
          onClick={startAnimation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPlaying}
        >
          Start
        </button>
        <button
          onClick={resetAnimation}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
        >
          Reset
        </button>
      </div>
      {/* Information Display */}
      <div className="mt-3 text-sm text-gray-600 text-center">
        <p className="font-medium text-green-700">
          Experiment with different masses and velocities to see momentum conservation in action!
        </p>
      </div>
    </div>
  );
};

/**
 * Lesson on Momentum in One Dimension for Physics 30
 */
const MomentumOneDimension = ({ course, courseId = '2', onPrepopulateMessage, createAskAIButton, createAskAIButtonFromElement,
AIAccordion, onAIAccordionContent }) => {
  // TEMPORARY FIX: Removed useAuth dependency to avoid permission errors
  // const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [isMomentumConceptOpen, setIsMomentumConceptOpen] = useState(false);
  const [isExplosionsOpen, setIsExplosionsOpen] = useState(false);  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isExample4Open, setIsExample4Open] = useState(false);
  const [isExample5Open, setIsExample5Open] = useState(false);
  const [isExample6Open, setIsExample6Open] = useState(false);  const [isInertiaVsMomentumOpen, setIsInertiaVsMomentumOpen] = useState(false);  const [currentMomentumProblem, setCurrentMomentumProblem] = useState(0);
  const [currentCollisionProblem, setCurrentCollisionProblem] = useState(0);
  const [currentAdvancedProblem, setCurrentAdvancedProblem] = useState(0);
  
  // Assessment IDs for the lesson
  const multipleChoiceId = 'q1_momentum_concepts';
  const dynamicQuestionId = 'q2_momentum_calculation';

  // Get courseId from the course object
  const effectiveCourseId = String(course?.CourseID || course?.courseId || course?.id || courseId || '2');
  
  // Firebase references
  // TEMPORARY FIX: Commented out to avoid Firebase permission errors
  // const functions = getFunctions();
  // const db = getDatabase();

  // Momentum practice problems data
  const momentumPracticeProblems = [
    {
      id: 1,
      question: "A 75 kg person runs east at 6.0 m/s. What is their momentum?",
      given: ["Mass: m = 75 kg", "Velocity: v = 6.0 m/s east"],
      equation: "\\vec{p} = m\\vec{v}",
      solution: "\\vec{p} = (75~\\text{kg})(6.0~\\text{m/s}) = 450~\\text{kg}\\cdot\\text{m/s}",
      answer: "450 kg·m/s east"
    },
    {
      id: 2,
      question: "A 0.15 kg baseball has a momentum of 6.0 kg·m/s south. What is its velocity?",
      given: ["Mass: m = 0.15 kg", "Momentum: p = 6.0 kg·m/s south"],
      equation: "\\vec{v} = \\frac{\\vec{p}}{m}",
      solution: "\\vec{v} = \\frac{6.0~\\text{kg}\\cdot\\text{m/s}}{0.15~\\text{kg}} = 40~\\text{m/s}",
      answer: "40 m/s south"
    },
    {
      id: 3,
      question: "A truck with momentum 3.6 × 10⁴ kg·m/s west travels at 12 m/s. What is its mass?",
      given: ["Momentum: p = 3.6 × 10⁴ kg·m/s west", "Velocity: v = 12 m/s west"],
      equation: "m = \\frac{|\\vec{p}|}{|\\vec{v}|}",
      solution: "m = \\frac{3.6 \\times 10^4~\\text{kg}\\cdot\\text{m/s}}{12~\\text{m/s}} = 3.0 \\times 10^3~\\text{kg}",
      answer: "3.0 × 10³ kg"
    },
    {
      id: 4,
      question: "A 2000 kg car traveling north at 15 m/s collides with a 1500 kg car traveling south at 10 m/s. What is the total momentum before collision?",
      given: ["Car 1: m₁ = 2000 kg, v₁ = 15 m/s north", "Car 2: m₂ = 1500 kg, v₂ = 10 m/s south"],
      equation: "\\vec{p}_{total} = \\vec{p}_1 + \\vec{p}_2",
      solution: "\\vec{p}_1 = (2000)(15) = 30000~\\text{kg}\\cdot\\text{m/s north}, \\vec{p}_2 = (1500)(-10) = -15000~\\text{kg}\\cdot\\text{m/s}, \\vec{p}_{total} = 30000 + (-15000) = 15000~\\text{kg}\\cdot\\text{m/s}",
      answer: "1.5 × 10⁴ kg·m/s north"
    },
    {
      id: 5,
      question: "A 0.05 kg arrow is shot from a bow and has a momentum of 15 kg·m/s. If the arrow was in contact with the bowstring for 0.02 s, what was the average force applied?",
      given: ["Mass: m = 0.05 kg", "Final momentum: p = 15 kg·m/s", "Time: Δt = 0.02 s", "Initial momentum: p₀ = 0"],
      equation: "F = \\frac{\\Delta p}{\\Delta t}",
      solution: "\\Delta p = 15 - 0 = 15~\\text{kg}\\cdot\\text{m/s}, F = \\frac{15~\\text{kg}\\cdot\\text{m/s}}{0.02~\\text{s}} = 750~\\text{N}",
      answer: "750 N"
    },
    {
      id: 6,
      question: "A 60 kg skater moving east at 8.0 m/s collides with a 40 kg skater at rest. After collision, they move together. What is their final velocity?",
      given: ["Skater 1: m₁ = 60 kg, v₁ = 8.0 m/s east", "Skater 2: m₂ = 40 kg, v₂ = 0 m/s", "Final: combined mass = 100 kg"],
      equation: "m_1v_1 + m_2v_2 = (m_1 + m_2)v_f",
      solution: "(60)(8.0) + (40)(0) = (100)v_f, 480 = 100v_f, v_f = 4.8~\\text{m/s}",
      answer: "4.8 m/s east"
    },
    {
      id: 7,
      question: "A 1200 kg car moving at 20 m/s east collides with a 1000 kg car moving at 15 m/s west. After collision, the first car moves at 5.0 m/s east. What is the final velocity of the second car?",
      given: ["Car 1: m₁ = 1200 kg, v₁ᵢ = 20 m/s east, v₁f = 5.0 m/s east", "Car 2: m₂ = 1000 kg, v₂ᵢ = 15 m/s west"],
      equation: "m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}",
      solution: "(1200)(20) + (1000)(-15) = (1200)(5.0) + (1000)v_{2f}, 24000 - 15000 = 6000 + 1000v_{2f}, v_{2f} = 3.0~\\text{m/s}",
      answer: "3.0 m/s east"
    },
    {
      id: 8,
      question: "A 0.5 kg ball moving at 10 m/s east strikes a wall and bounces back at 8.0 m/s west. What is the change in momentum?",
      given: ["Mass: m = 0.5 kg", "Initial velocity: vᵢ = 10 m/s east", "Final velocity: vf = 8.0 m/s west"],
      equation: "\\Delta p = m(v_f - v_i)",
      solution: "\\Delta p = (0.5)[(-8.0) - (10)] = (0.5)(-18) = -9.0~\\text{kg}\\cdot\\text{m/s}",
      answer: "9.0 kg·m/s west"
    }  ];

  // Collision practice problems data
  const collisionPracticeProblems = [
    {
      id: 1,
      question: "A 3.0 kg object moving at 8.0 m/s east collides elastically with a 2.0 kg object at rest. What are the final velocities? (Use elastic collision formulas)",
      given: ["Object 1: m₁ = 3.0 kg, v₁ᵢ = 8.0 m/s east", "Object 2: m₂ = 2.0 kg, v₂ᵢ = 0 m/s", "Collision: elastic"],
      equation: "v_{1f} = \\frac{(m_1 - m_2)v_{1i} + 2m_2v_{2i}}{m_1 + m_2}, v_{2f} = \\frac{(m_2 - m_1)v_{2i} + 2m_1v_{1i}}{m_1 + m_2}",
      solution: "v_{1f} = \\frac{(3.0 - 2.0)(8.0) + 2(2.0)(0)}{3.0 + 2.0} = \\frac{8.0}{5.0} = 1.6~\\text{m/s}, v_{2f} = \\frac{2(3.0)(8.0)}{5.0} = 9.6~\\text{m/s}",
      answer: "Object 1: 1.6 m/s east, Object 2: 9.6 m/s east"
    },
    {
      id: 2,
      question: "A 1500 kg car moving at 25 m/s north collides with a 1200 kg car moving at 20 m/s south. They stick together after collision. What is their final velocity?",
      given: ["Car 1: m₁ = 1500 kg, v₁ = 25 m/s north", "Car 2: m₂ = 1200 kg, v₂ = 20 m/s south", "Collision: completely inelastic"],
      equation: "m_1v_1 + m_2v_2 = (m_1 + m_2)v_f",
      solution: "(1500)(25) + (1200)(-20) = (2700)v_f, 37500 - 24000 = 2700v_f, v_f = 5.0~\\text{m/s}",
      answer: "5.0 m/s north"
    },
    {
      id: 3,
      question: "A 0.2 kg hockey puck moving at 15 m/s east collides with a 0.18 kg puck moving at 12 m/s west. After collision, the first puck moves at 3.0 m/s west. Find the final velocity of the second puck.",
      given: ["Puck 1: m₁ = 0.2 kg, v₁ᵢ = 15 m/s east, v₁f = 3.0 m/s west", "Puck 2: m₂ = 0.18 kg, v₂ᵢ = 12 m/s west"],
      equation: "m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}",
      solution: "(0.2)(15) + (0.18)(-12) = (0.2)(-3.0) + (0.18)v_{2f}, 3.0 - 2.16 = -0.6 + 0.18v_{2f}, v_{2f} = 13.7~\\text{m/s}",
      answer: "13.7 m/s east"
    },
    {
      id: 4,
      question: "A 80 kg football player running at 7.5 m/s north tackles a 70 kg player running at 5.0 m/s south. They fall together after the tackle. What is their combined velocity?",
      given: ["Player 1: m₁ = 80 kg, v₁ = 7.5 m/s north", "Player 2: m₂ = 70 kg, v₂ = 5.0 m/s south", "Collision: completely inelastic"],
      equation: "m_1v_1 + m_2v_2 = (m_1 + m_2)v_f",
      solution: "(80)(7.5) + (70)(-5.0) = (150)v_f, 600 - 350 = 150v_f, v_f = 1.67~\\text{m/s}",
      answer: "1.67 m/s north"
    },
    {
      id: 5,
      question: "Two identical 1.5 kg balls approach each other with equal speeds of 6.0 m/s and collide head-on elastically. What are their velocities after collision?",
      given: ["Ball 1: m₁ = 1.5 kg, v₁ᵢ = 6.0 m/s", "Ball 2: m₂ = 1.5 kg, v₂ᵢ = -6.0 m/s", "Collision: elastic, head-on"],
      equation: "\\text{For equal masses in head-on elastic collision: } v_{1f} = v_{2i}, v_{2f} = v_{1i}",
      solution: "v_{1f} = v_{2i} = -6.0~\\text{m/s}, v_{2f} = v_{1i} = 6.0~\\text{m/s}",
      answer: "Ball 1: 6.0 m/s opposite direction, Ball 2: 6.0 m/s opposite direction"
    },
    {
      id: 6,
      question: "A 2500 kg truck moving at 15 m/s east collides with a stationary 1800 kg car. After collision, the truck moves at 8.0 m/s east. Is this collision elastic or inelastic?",
      given: ["Truck: m₁ = 2500 kg, v₁ᵢ = 15 m/s east, v₁f = 8.0 m/s east", "Car: m₂ = 1800 kg, v₂ᵢ = 0 m/s"],
      equation: "\\text{Find } v_{2f} \\text{ then compare } KE_i \\text{ and } KE_f",
      solution: "v_{2f} = \\frac{m_1(v_{1i} - v_{1f})}{m_2} = \\frac{2500(15 - 8.0)}{1800} = 9.72~\\text{m/s}, KE_i = 281250~\\text{J}, KE_f = 165000~\\text{J}",
      answer: "Car's final velocity: 9.72 m/s east; Collision is inelastic (KE not conserved)"
    },
    {
      id: 7,
      question: "A 0.8 kg ball moving at 12 m/s east collides with a 1.2 kg ball moving at 8.0 m/s west. After collision, the lighter ball moves at 4.0 m/s west. What is the final kinetic energy of the system?",
      given: ["Ball 1: m₁ = 0.8 kg, v₁ᵢ = 12 m/s east, v₁f = 4.0 m/s west", "Ball 2: m₂ = 1.2 kg, v₂ᵢ = 8.0 m/s west"],
      equation: "\\text{Find } v_{2f} \\text{ using momentum conservation, then calculate total } KE_f",
      solution: "v_{2f} = 2.67~\\text{m/s east}, KE_f = \\frac{1}{2}(0.8)(4.0)^2 + \\frac{1}{2}(1.2)(2.67)^2 = 6.4 + 4.28 = 10.7~\\text{J}",
      answer: "Final kinetic energy: 10.7 J"
    },
    {
      id: 8,
      question: "A 5.0 kg object explodes into two pieces. One piece (2.0 kg) flies north at 25 m/s. If the explosion occurs while the object is at rest, what is the velocity of the other piece?",
      given: ["Original object: m = 5.0 kg, v = 0 m/s", "Piece 1: m₁ = 2.0 kg, v₁ = 25 m/s north", "Piece 2: m₂ = 3.0 kg"],
      equation: "m_0v_0 = m_1v_1 + m_2v_2",
      solution: "(5.0)(0) = (2.0)(25) + (3.0)v_2, 0 = 50 + 3.0v_2, v_2 = -16.7~\\text{m/s}",
      answer: "16.7 m/s south"    }
  ];

  // Advanced practice problems data - complex multi-step problems
  const advancedPracticeProblems = [
    {
      id: 1,
      question: "A 1500 kg car traveling at 20 m/s east collides head-on with a 1200 kg car traveling at 15 m/s west. After collision, the 1500 kg car moves at 5.0 m/s west. Calculate: (a) the final velocity of the 1200 kg car, (b) the change in kinetic energy, and (c) determine if the collision is elastic or inelastic.",
      given: ["Car 1: m₁ = 1500 kg, v₁ᵢ = 20 m/s east, v₁f = 5.0 m/s west", "Car 2: m₂ = 1200 kg, v₂ᵢ = 15 m/s west"],
      equation: "\\text{Conservation of momentum: } m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}",
      solution: "(1500)(20) + (1200)(-15) = (1500)(-5) + (1200)v_{2f}, v_{2f} = 15~\\text{m/s east}, \\Delta KE = -112500~\\text{J}",
      answer: "(a) 15 m/s east, (b) ΔKE = -112.5 kJ, (c) Inelastic (energy lost)"
    },
    {
      id: 2,
      question: "A 3.0 kg block sliding at 8.0 m/s on a frictionless surface collides with a 2.0 kg block at rest. After collision, the 3.0 kg block moves at 2.0 m/s in the same direction. The 2.0 kg block then slides up a 30° incline. Find: (a) the velocity of the 2.0 kg block after collision, (b) the maximum height it reaches on the incline.",
      given: ["Block 1: m₁ = 3.0 kg, v₁ᵢ = 8.0 m/s, v₁f = 2.0 m/s", "Block 2: m₂ = 2.0 kg, v₂ᵢ = 0 m/s", "Incline angle: θ = 30°"],
      equation: "\\text{Momentum: } m_1v_{1i} = m_1v_{1f} + m_2v_{2f}, \\text{ Energy: } \\frac{1}{2}mv^2 = mgh",
      solution: "v_{2f} = 9.0~\\text{m/s}, h = \\frac{v^2}{2g} = \\frac{(9.0)^2}{2(9.8)} = 4.13~\\text{m}",
      answer: "(a) 9.0 m/s, (b) 4.13 m maximum height"
    },
    {
      id: 3,
      question: "Two identical 0.5 kg balls approach each other with speeds of 10 m/s and 6.0 m/s respectively. After an elastic collision, the faster ball moves at 6.0 m/s in the opposite direction. Find: (a) the final velocity of the slower ball, (b) verify that kinetic energy is conserved.",
      given: ["Ball 1: m₁ = 0.5 kg, v₁ᵢ = 10 m/s", "Ball 2: m₂ = 0.5 kg, v₂ᵢ = -6.0 m/s", "After collision: v₁f = -6.0 m/s", "Collision: elastic"],
      equation: "\\text{Momentum: } m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}, \\text{ Energy: } KE_i = KE_f",
      solution: "v_{2f} = 10~\\text{m/s}, KE_i = 34~\\text{J}, KE_f = 34~\\text{J}",
      answer: "(a) 10 m/s opposite direction, (b) KE conserved (34 J before and after)"
    },
    {
      id: 4,
      question: "A 2.5 kg projectile explodes at the top of its trajectory into three pieces. Piece A (0.8 kg) flies north at 15 m/s, piece B (0.9 kg) flies south at 20 m/s. If the original projectile had a horizontal velocity of 12 m/s east at explosion, find the velocity of piece C.",
      given: ["Original projectile: m = 2.5 kg, vₓ = 12 m/s east, vᵧ = 0 m/s", "Piece A: m₁ = 0.8 kg, v₁ = 15 m/s north", "Piece B: m₂ = 0.9 kg, v₂ = 20 m/s south", "Piece C: m₃ = 0.8 kg"],
      equation: "\\text{2D momentum conservation: } \\vec{p}_{total} = \\vec{p}_A + \\vec{p}_B + \\vec{p}_C",
      solution: "v_{Cx} = 37.5~\\text{m/s east}, v_{Cy} = 6.25~\\text{m/s north}, |v_C| = 38.0~\\text{m/s}",
      answer: "38.0 m/s at 9.5° north of east"
    },
    {
      id: 5,
      question: "A 4.0 kg ball moving at 12 m/s collides with a 6.0 kg ball at rest. After collision, they move together and slide across a rough surface with coefficient of friction μ = 0.25. Find: (a) their velocity just after collision, (b) the distance they slide before stopping.",
      given: ["Ball 1: m₁ = 4.0 kg, v₁ᵢ = 12 m/s", "Ball 2: m₂ = 6.0 kg, v₂ᵢ = 0 m/s", "Combined mass slides on rough surface", "Coefficient of friction: μ = 0.25"],
      equation: "\\text{Inelastic collision: } m_1v_{1i} = (m_1 + m_2)v_f, \\text{ Friction: } v_f^2 = 2\\mu g d",
      solution: "v_f = 4.8~\\text{m/s}, d = \\frac{v_f^2}{2\\mu g} = \\frac{(4.8)^2}{2(0.25)(9.8)} = 4.7~\\text{m}",
      answer: "(a) 4.8 m/s, (b) 4.7 m sliding distance"
    },
    {
      id: 6,
      question: "A 1.5 kg block is dropped from height h onto a 2.5 kg block sitting on a spring (k = 800 N/m). The blocks stick together and compress the spring. If the maximum compression is 0.15 m, find the height h from which the first block was dropped.",
      given: ["Block 1: m₁ = 1.5 kg, dropped from height h", "Block 2: m₂ = 2.5 kg, initially at rest", "Spring constant: k = 800 N/m", "Maximum compression: x = 0.15 m"],
      equation: "\\text{Energy conservation: } m_1gh = \\frac{1}{2}kx^2 + m_{total}gx",
      solution: "v_1 = \\sqrt{2gh}, \\text{after collision: } v_f = \\frac{m_1\\sqrt{2gh}}{m_1 + m_2}, \\text{solving: } h = 0.89~\\text{m}",
      answer: "Height h = 0.89 m"
    }
  ];

  // Navigation functions for momentum problems
  const nextMomentumProblem = () => {
    setCurrentMomentumProblem((prev) => (prev + 1) % momentumPracticeProblems.length);
  };

  const prevMomentumProblem = () => {
    setCurrentMomentumProblem((prev) => (prev - 1 + momentumPracticeProblems.length) % momentumPracticeProblems.length);
  };
  const goToMomentumProblem = (index) => {
    setCurrentMomentumProblem(index);
  };

  // Navigation functions for collision problems
  const nextCollisionProblem = () => {
    setCurrentCollisionProblem((prev) => (prev + 1) % collisionPracticeProblems.length);
  };

  const prevCollisionProblem = () => {
    setCurrentCollisionProblem((prev) => (prev - 1 + collisionPracticeProblems.length) % collisionPracticeProblems.length);
  };
  const goToCollisionProblem = (index) => {
    setCurrentCollisionProblem(index);
  };

  // Navigation functions for advanced problems
  const nextAdvancedProblem = () => {
    setCurrentAdvancedProblem((prev) => (prev + 1) % advancedPracticeProblems.length);
  };

  const prevAdvancedProblem = () => {
    setCurrentAdvancedProblem((prev) => (prev - 1 + advancedPracticeProblems.length) % advancedPracticeProblems.length);
  };

  const goToAdvancedProblem = (index) => {
    setCurrentAdvancedProblem(index);
  };

  useEffect(() => {
    // TEMPORARY FIX: Skip authentication check to avoid permission errors
    // if (!currentUser) {
    //   setError("You must be logged in to view this lesson");
    //   setLoading(false);
    //   return;
    // }

    if (!course) {
      setError("Course data is missing");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [course]);

  if (loading) {
    return <div>Loading...</div>;
  }  return (
    <LessonContent
      lessonId="lesson_1747281764415_851"
      title="Lesson 1 - Momentum and Conservation of Momentum in One Dimension"
      metadata={{ estimated_time: '120 minutes' }}
    >
     
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Physics Principles in Physics 30"
            value="physics-principles"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              Students often ask if Physics 30 is "harder" than Physics 20. This, of course, 
              depends on the aptitudes, attitudes and work ethic of the individual student. However, 
              there is one major difference between Physics 20 and Physics 30.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="mb-2">
                <strong>Physics 20:</strong> Dominated by problem solving and the calculation of an answer
              </p>
              <p>
                <strong>Physics 30:</strong> Has a substantial problem-solving component, but also requires 
                that students learn and understand the <span className="font-semibold text-blue-700">Physics Principles</span> that 
                form the foundation of physics
              </p>
            </div>
            
            <p className="mb-4">
              These principles are listed on your Physics Data Sheet and are reproduced below. 
              In other words, you will be required to explain how the physics principles are being 
              applied to a particular problem – you will demonstrate that you know the theory behind 
              the problem solving.
            </p>

            <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Physics Principles from Data Sheet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">0</span>
                  <span>Uniform motion</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">1</span>
                  <span>Accelerated motion</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">2</span>
                  <span>Uniform circular motion</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">3</span>
                  <span>Work-energy theorem</span>
                </div>
                <div className="flex items-start space-x-2 bg-green-100 px-2 py-1 rounded">
                  <span className="font-semibold text-green-700 min-w-[1.5rem]">4</span>
                  <span className="font-semibold text-green-700">Conservation of momentum</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">5</span>
                  <span>Conservation of energy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">6</span>
                  <span>Conservation of mass-energy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">7</span>
                  <span>Conservation of charge</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">8</span>
                  <span>Conservation of nucleons</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-blue-600 min-w-[1.5rem]">9</span>
                  <span>Wave-particle duality</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Physics Principles Overview:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="font-medium text-yellow-700 mr-2">Principles 0, 1, 2, 3, and 5:</span>
                  <span>Were taught in Physics 20 and will be seen again in different contexts in Physics 30</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-yellow-700 mr-2">Remaining principles:</span>
                  <span>Are what Physics 30 is all about</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>This lesson will introduce principle 4: </strong>
                <span className="font-semibold">The Conservation of Momentum</span>
              </p>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
     

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Momentum: A Fundamental Physical Concept"
            value="momentum-concept"
            onAskAI={onAIAccordionContent}
          >
                <p className="mb-4">
                  A very useful physical concept is momentum. The momentum (<InlineMath>{'p'}</InlineMath>) of an object is 
                  defined as the product of its mass and velocity.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p className="mb-2">
                    <strong>Important:</strong> Recall that velocity is a vector quantity that involves both a speed and a direction.
                  </p>
                  <p className="text-blue-700 font-medium">
                    Thus, momentum is a vector quantity.
                  </p>
                </div>                <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Momentum Formula</h4>
                  <div className="text-center mb-4">
                    <BlockMath>{'\\vec{p} = m\\vec{v}'}</BlockMath>
                  </div>                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-blue-600 min-w-[1.5rem]"><InlineMath>{'m'}</InlineMath></span>
                      <span>mass</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-blue-600 min-w-[1.5rem]"><InlineMath>{'\\vec{v}'}</InlineMath></span>
                      <span>velocity</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-blue-600 min-w-[1.5rem]"><InlineMath>{'\\vec{p}'}</InlineMath></span>
                      <span>momentum</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Units of Momentum:</h4>
                  <p className="mb-3 text-sm">
                    There is no chosen unit for momentum like there is for force (N) or energy (J). 
                    The unit for momentum is a combination of the mass unit and velocity unit.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="bg-yellow-100 px-3 py-2 rounded text-center">
                      <InlineMath>{'\\text{kg}\\cdot\\text{m/s}'}</InlineMath>
                    </div>
                    <div className="bg-yellow-100 px-3 py-2 rounded text-center">
                      <InlineMath>{'\\text{kg}\\cdot\\text{km/h}'}</InlineMath>
                    </div>
                    <div className="bg-yellow-100 px-3 py-2 rounded text-center">
                      <InlineMath>{'\\text{g}\\cdot\\text{m/s}'}</InlineMath>
                    </div>
                  </div>
                </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-sm text-gray-700">
                <strong>Reference:</strong> You may refer to Pearson pages 446 to 449 for a different 
                discussion about momentum.
              </p>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Example 1: Calculating Momentum"
            value="example-1"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              Let's solve a problem involving momentum calculation using the momentum formula.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg mb-3">Problem:</h4>
              <p className="mb-4">What is the momentum of a 1500 kg car travelling west at 5.0 m/s?</p>
              
              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">Solution:</p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Identify known values:</strong>
                    <div className="pl-4 mt-2 space-y-4">
                      <div>
                        <div className="group relative cursor-help mb-2">
                          <div className="flex items-baseline">
                            <div className="w-48">Mass:</div>
                            <div><InlineMath>{'m = 1500~\\text{kg}'}</InlineMath></div>
                            <span className="ml-1 text-blue-500 text-xs relative">
                              ⓘ
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                The mass of the car
                              </div>
                            </span>
                          </div>
                        </div>
                        <div className="group relative cursor-help mb-2">
                          <div className="flex items-baseline">
                            <div className="w-48">Velocity:</div>
                            <div><InlineMath>{'\\vec{v} = 5.0~\\text{m/s}'}</InlineMath> west</div>
                            <span className="ml-1 text-blue-500 text-xs relative">
                              ⓘ
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                                Velocity is a vector quantity with both magnitude and direction
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
                      <p className="border-b border-dotted border-blue-300 inline-block">For momentum calculation:</p>
                      <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                      <BlockMath>{'\\vec{p} = m\\vec{v}'}</BlockMath>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                        Momentum is the product of mass and velocity
                      </div>
                    </div>
                  </li>
                  <li>
                    <strong>Substitute values:</strong>
                    <div className="pl-4 mt-2">
                      <BlockMath>{'\\vec{p} = (1500~\\text{kg})(5.0~\\text{m/s})'}</BlockMath>
                      <BlockMath>{'\\vec{p} = 7500~\\text{kg}\\cdot\\text{m/s}'}</BlockMath>
                      <BlockMath>{'\\vec{p} = 7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}'}</BlockMath>
                    </div>
                  </li>
                  <li>
                    <strong>Final answer:</strong>
                    <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                      <span>The momentum of the car is <InlineMath>{'7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}'}</InlineMath> west</span>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                          Remember to include the direction since momentum is a vector quantity
                        </div>
                      </span>
                    </p>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 group relative cursor-help inline-flex items-center">
                    <span>Note: The direction (west) is essential since momentum is a vector quantity</span>
                    <span className="ml-1 text-blue-500 text-xs relative">
                      ⓘ
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                        Vector quantities require both magnitude and direction to be completely specified
                      </div>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

     
  <AIAccordion theme="blue">
    <AIAccordion.Item
      title="Example 2: Finding Velocity from Momentum"
      value="example-2"
      onAskAI={onAIAccordionContent}
    >
      <p className="mb-4">
        This example shows how to find velocity when momentum and mass are known, using the same momentum from Example 1.
      </p>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-3">Problem:</h4>
        <p className="mb-4">
          A micro-meteorite with a mass of 5.0 g has the same momentum as the car in Example 1. 
          What is the velocity of the meteorite?
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
                      <div className="w-48">Mass of meteorite:</div>
                      <div><InlineMath>{'m = 5.0~\\text{g} = 0.0050~\\text{kg}'}</InlineMath></div>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                          Convert grams to kilograms for consistency
                        </div>
                      </span>
                    </div>
                  </div>
                  <div className="group relative cursor-help mb-2">
                    <div className="flex items-baseline">
                      <div className="w-48">Momentum:</div>
                      <div><InlineMath>{'\\vec{p} = 7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}'}</InlineMath> west</div>
                      <span className="ml-1 text-blue-500 text-xs relative">
                        ⓘ
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-48 pointer-events-none z-10">
                          Same momentum as the car from Example 1
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
                <p className="border-b border-dotted border-blue-300 inline-block">Rearrange momentum formula to solve for velocity:</p>
                <span className="ml-1 inline-block text-blue-500 text-xs">ⓘ</span>
                <BlockMath>{'\\vec{p} = m\\vec{v}'}</BlockMath>
                <BlockMath>{'\\vec{v} = \\frac{\\vec{p}}{m}'}</BlockMath>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none">
                  Divide both sides by mass to isolate velocity
                </div>
              </div>
            </li>
            <li>
              <strong>Substitute values:</strong>
              <div className="pl-4 mt-2">
                <BlockMath>{'\\vec{v} = \\frac{7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}}{0.0050~\\text{kg}}'}</BlockMath>
                <BlockMath>{'\\vec{v} = \\frac{7.5 \\times 10^3}{5.0 \\times 10^{-3}}~\\text{m/s}'}</BlockMath>
                <BlockMath>{'\\vec{v} = 1.5 \\times 10^6~\\text{m/s}'}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Final answer:</strong>
              <p className="pl-4 mt-1 group relative cursor-help inline-flex items-center">
                <span>The velocity of the meteorite is <InlineMath>{'1.5 \\times 10^6~\\text{m/s}'}</InlineMath> west</span>
                <span className="ml-1 text-blue-500 text-xs relative">
                  ⓘ
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded left-6 -top-1 w-64 pointer-events-none z-10">
                    This is about 0.5% the speed of light - extremely fast!
                  </div>
                </span>
              </p>
            </li>
          </ol>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Physical Insight:</strong> Notice how the tiny mass of the meteorite (5.0 g) requires 
                an enormous velocity (1.5 × 10⁶ m/s) to have the same momentum as a much more massive 
                car (1500 kg) moving at a relatively slow speed (5.0 m/s). This demonstrates the inverse 
                relationship between mass and velocity when momentum is constant.
              </p>
           
              </div> 
            </div>    
          </div>       
        </div>        
    </AIAccordion.Item>
  </AIAccordion>


    
  <AIAccordion theme="amber">
    <AIAccordion.Item
      title="⚠️ Important Note: Inertia vs Momentum"
      value="inertia-vs-momentum"
      onAskAI={onAIAccordionContent}
    >
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-800 font-medium mb-2">
            <strong>Common Misconception Alert!</strong>
          </p>
          <p className="text-red-700">
            A major misconception that people have is that <span className="font-semibold">inertia and momentum mean the same thing</span>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-300 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">Comparing Our Examples:</h4>
          <p className="mb-4">
            In the examples above, both objects have the <span className="font-semibold text-blue-700">same momentum</span> 
            (mass × velocity) but the <span className="font-semibold text-green-700">inertia</span> (i.e. mass) of the 
            car is substantially larger than the inertia of the meteorite.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">Car (Example 1)</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mass (Inertia):</span>
                  <span className="font-mono"><InlineMath>{'1500~\\text{kg}'}</InlineMath></span>
                </div>
                <div className="flex justify-between">
                  <span>Velocity:</span>
                  <span className="font-mono"><InlineMath>{'5.0~\\text{m/s}'}</InlineMath></span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Momentum:</span>
                  <span className="font-mono"><InlineMath>{'7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}'}</InlineMath></span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h5 className="font-semibold text-green-800 mb-2">Meteorite (Example 2)</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mass (Inertia):</span>
                  <span className="font-mono"><InlineMath>{'0.0050~\\text{kg}'}</InlineMath></span>
                </div>
                <div className="flex justify-between">
                  <span>Velocity:</span>
                  <span className="font-mono"><InlineMath>{'1.5 \\times 10^6~\\text{m/s}'}</InlineMath></span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Momentum:</span>
                  <span className="font-mono"><InlineMath>{'7.5 \\times 10^3~\\text{kg}\\cdot\\text{m/s}'}</InlineMath></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">Key Distinctions</h4>
          <div className="space-y-4">
            <div className="group relative cursor-help">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded border border-green-200">
                <div className="font-semibold text-green-700 min-w-[4rem]">
                  <InlineMath>{'\\text{Inertia}'}</InlineMath>
                </div>
                <div>
                  <p className="text-green-800">
                    Refers to the <span className="font-semibold">mass of an object</span>
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    • Measures resistance to changes in motion<br/>
                    • Scalar quantity (no direction)<br/>
                    • Units: kg
                  </p>
                </div>
                <span className="text-green-500 text-xs">ⓘ</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none z-10">
                  Inertia is a property of matter that quantifies how much an object resists acceleration
                </div>
              </div>
            </div>

            <div className="group relative cursor-help">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="font-semibold text-blue-700 min-w-[4rem]">
                  <InlineMath>{'\\text{Momentum}'}</InlineMath>
                </div>
                <div>
                  <p className="text-blue-800">
                    Refers to the <span className="font-semibold">mass and motion of the object</span>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    • Measures quantity of motion<br/>
                    • Vector quantity (has direction)<br/>
                    • Units: kg·m/s
                  </p>
                </div>
                <span className="text-blue-500 text-xs">ⓘ</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bg-gray-800 text-white text-sm p-2 rounded top-full mt-2 left-0 w-64 pointer-events-none z-10">
                  Momentum combines both the mass of an object and its velocity to describe its motion
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Memory Tip:</strong> Think of inertia as "how stubborn" an object is about changing its motion, 
              while momentum describes "how much motion" an object actually has.
            </p>
          </div>
        </div>
        </div>
      </AIAccordion.Item>
  </AIAccordion>



      
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="02-momentum-one-dimension"
          course={course}
          onAIAccordionContent={onAIAccordionContent}
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q1',
              title: 'Question 1: Inertia vs Momentum'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q2',
              title: 'Question 2: Bowling Ball Momentum'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q3',
              title: 'Question 3: Bullet Velocity'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q4',
              title: 'Question 4: Hockey Puck Mass'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q5',
              title: 'Question 5: Jet Momentum'
            }
          ]}
          theme="blue"
          onComplete={(score, results) => {
            console.log(`Momentum Knowledge Check completed with ${score}% score`);
          }}
        />
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Systems"
            value="systems"
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                Before we can understand momentum more fully, we must also be aware of different 
                kinds of systems. There are several types of systems:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Types of Systems</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <h5 className="font-semibold text-green-700 mb-2">Closed System</h5>
                      <p className="text-sm text-green-800">No mass enters or leaves the system</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h5 className="font-semibold text-blue-700 mb-2">Isolated System</h5>
                      <p className="text-sm text-blue-800">No external forces act on the system and no energy leaves the system</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <h5 className="font-semibold text-red-700 mb-2">Open System</h5>
                      <p className="text-sm text-red-800">Mass may enter or leave the system and external forces may influence the system</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-amber-800 mb-3">Real-Life Example: Car Collision</h4>
                <p className="mb-3">
                  To illustrate the difference between these kinds of systems, consider a real-life collision 
                  between two cars:
                </p>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded border border-amber-100">
                    <p className="mb-2">
                      <span className="font-semibold text-amber-700">1.</span> The collision of the cars is 
                      <strong> not an isolated system</strong> – i.e. they are not isolated from the Earth. 
                      Frictional forces between the Earth and the cars will cause the cars to slow down.
                    </p>
                    <p className="text-amber-600 italic text-sm">
                      If the cars collided on a very slippery surface where the frictional forces with the 
                      Earth were minimised, this would almost constitute an isolated system.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded border border-amber-100">
                    <p className="mb-2">
                      <span className="font-semibold text-amber-700">2.</span> If the cars collide and all 
                      of the parts of the cars stay attached to the cars we have a <strong>closed system</strong>.
                    </p>
                    <p className="text-amber-600 italic text-sm">
                      However, if parts of the cars fly off we have an <strong>open system</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Important for Our Study:</h4>
                <p className="text-purple-900">
                  In our investigation of the conservation of momentum below we will be assuming 
                  <strong> closed and isolated systems</strong>.
                </p>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Conservation of Momentum"
            value="conservation-of-momentum"
            onAskAI={onAIAccordionContent}
          >
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  The real importance of the concept of momentum is that in any isolated closed system, 
                  the total momentum of the system is conserved (i.e. remains constant).
                </p>
                  <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Interactive Collision Example</h4>
                  <p className="mb-4">
                    For example, consider two objects (<InlineMath>{'m_1'}</InlineMath> and <InlineMath>{'m_2'}</InlineMath>) that collide as shown below:
                  </p>
                  
                  <CollisionAnimation />
                  
                  <p className="text-sm text-gray-700 mt-4">
                    Although the momentum of each individual object changes during the collision, the sum 
                    of the momenta before the collision (<InlineMath>{'m_1v_1 + m_2v_2'}</InlineMath>) and after the collision 
                    (<InlineMath>{'m_1v_1\' + m_2v_2\''}</InlineMath>) are the same.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">Law of Conservation of Momentum</h4>
                  <p className="mb-3">
                    The general statement for the law of conservation of momentum is:
                  </p>
                  <div className="bg-white p-4 rounded border border-green-300 mb-3">
                    <p className="text-center font-semibold text-gray-800">
                      The total momentum of an isolated system of objects remains constant.
                    </p>
                  </div>
                  <p className="mb-3">
                    In other words, the sum of the momenta before a collision or explosion (<InlineMath>{'\\vec{p}'}</InlineMath>) equals the 
                    sum of the momenta after a collision or explosion (<InlineMath>{'\\vec{p}\''}</InlineMath>).
                  </p>
                  <div className="text-center mb-3">
                    <BlockMath>{'\\vec{p} = \\vec{p}\''}</BlockMath>
                  </div>
                  <p className="text-sm text-green-700 italic">
                    Note that the prime symbol (') is used to denote "after" the collision or explosion.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Universal Application</h4>
                  <p className="mb-3">
                    In any collision or explosion, the total momentum is always conserved. This principle 
                    proves to be very useful in predicting what will happen when objects collide or explode.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-amber-800 mb-3">Connection to Newton's Third Law</h4>
                  <p className="mb-3">
                    Actually, the principle of the Conservation of Momentum is a direct consequence of 
                    Newton's Third Law of Motion that we learned about in Physics 20.
                  </p>
                  <p className="mb-4">
                    Recall that when any object exerts a force on another object, the second object will exert an equal and 
                    opposite force on the first object. Consider the collision between the two masses illustrated above.
                  </p>
                  
                  <div className="bg-white p-4 rounded border border-amber-300 mb-4">
                    <h5 className="font-semibold text-gray-800 mb-2">During Collision:</h5>
                    <ul className="space-y-2 text-sm">
                      <li>• Mass 1 exerts a force on mass 2 (<InlineMath>{'\\vec{F}_{1\\text{ on }2}'}</InlineMath>) resulting in an acceleration (change in velocity) of mass 2</li>
                      <li>• According to Newton's 3rd Law, object 2 exerts an equal and opposite reaction force on object 1 (<InlineMath>{'\\vec{F}_{2\\text{ on }1}'}</InlineMath>)</li>
                      <li>• Therefore: <InlineMath>{'\\vec{F}_{1\\text{ on }2} = -\\vec{F}_{2\\text{ on }1}'}</InlineMath></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Mathematical Derivation</h4>
                  <p className="mb-3">If we apply Newton's Second Law of Motion:</p>
                  
                  <div className="bg-white p-4 rounded border border-purple-300 mb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm mb-2">Since <InlineMath>{'\\vec{F} = m\\vec{a} = \\frac{\\Delta m\\vec{v}}{\\Delta t}'}</InlineMath></p>
                        <BlockMath>{'\\vec{F}_{1\\text{ on }2} = -\\vec{F}_{2\\text{ on }1}'}</BlockMath>
                      </div>
                      
                      <div>
                        <BlockMath>{'\\frac{\\Delta m_2\\vec{v_2}}{\\Delta t} = -\\frac{\\Delta m_1\\vec{v_1}}{\\Delta t}'}</BlockMath>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p>• <InlineMath>{'\\vec{F}_{1\\text{ on }2}'}</InlineMath> causes a change in the momentum of object 2</p>
                        <p>• <InlineMath>{'\\vec{F}_{2\\text{ on }1}'}</InlineMath> causes a change in momentum of object 1</p>
                        <p>• The time of contact is the same for both objects</p>
                        <p>• <InlineMath>{'\\Delta t'}</InlineMath> cancels out</p>
                      </div>
                      
                      <div>
                        <p className="mb-2">Notice that when the change in momentum of objects 1 and 2 are added together, the result is zero:</p>
                        <BlockMath>{'\\Delta m_1\\vec{v_1} + \\Delta m_2\\vec{v_2} = 0'}</BlockMath>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 border border-green-300 rounded p-3">
                    <p className="text-sm text-green-800">
                      <strong>Conclusion:</strong> This result indicates that while the momentum of each object changes, 
                      the total change in momentum of the system (i.e. both objects) is zero. This is also a 
                      statement of the principle of conservation of momentum.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Elastic and Inelastic Collisions"
            value="elastic-and-inelastic-collisions"
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                There are two basic types of collisions – elastic and inelastic – and we use the law of 
                conservation of momentum to predict and calculate the results.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">Elastic Collisions</h4>
                <p className="mb-3">
                  Elastic collisions are those where both momentum and kinetic energy are conserved. 
                  Purely elastic collisions are very hard to produce in the ordinary world because there is 
                  always some kinetic energy converted into heat, sound, deformation or some other form 
                  of energy.
                </p>
                <p className="text-sm text-green-700 italic">
                  As we shall see in future lessons on the nature of the atom, collisions 
                  between subatomic particles are elastic collisions.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-800 mb-3">Inelastic Collisions</h4>
                <p className="mb-3">
                  Inelastic collisions are those where momentum is conserved, but kinetic energy is not 
                  conserved.
                </p>
                <div className="bg-white p-4 rounded border border-red-300">
                  <p className="text-center font-semibold text-gray-800">
                    A completely inelastic collision is when the objects collide and stick together.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Example 3: Collision Problem with Conservation of Momentum"
            value="example-3-collision-problem"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              This example demonstrates how to apply conservation of momentum to solve collision problems.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg mb-3">Problem:</h4>
              <p className="mb-4">
                A 2.00 kg object travelling east at 4.00 m/s collides with a 3.00 kg object travelling west 
                at 1.50 m/s. If the 3.00 kg object ends up travelling east at 1.25 m/s, what is the final 
                velocity of the 2.00 kg object?
              </p>
                <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">Solution:</p>

                {/* Data Summary Tables with Integrated Diagrams */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Collision Data with Diagram */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-3">Before Collision</h5>
                      
                      {/* Collision Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Object 1 - simple circle */}
                          <circle cx="75" cy="40" r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                          
                          {/* Momentum arrow for object 1 */}
                          <defs>
                            <marker id="arrowhead1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                              <polygon points="0 0, 6 2, 0 4" fill="#000000"/>
                            </marker>
                          </defs>
                          <line x1="95" y1="40" x2="130" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead1)"/>
                          
                          {/* Object 2 - simple circle */}
                          <circle cx="225" cy="40" r="18" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                          
                          {/* Momentum arrow for object 2 */}
                          <defs>
                            <marker id="arrowhead2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                              <polygon points="0 0, 6 2, 0 4" fill="#000000"/>
                            </marker>
                          </defs>
                          <line x1="205" y1="40" x2="170" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead2)"/>
                        </svg>
                      </div>                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_1 ='}</InlineMath></div>
                          <div><InlineMath>{'2.00~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_1 ='}</InlineMath></div>
                          <div><InlineMath>{'+4.00~\\text{m/s}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_2 ='}</InlineMath></div>
                          <div><InlineMath>{'3.00~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_2 ='}</InlineMath></div>
                          <div><InlineMath>{'-1.50~\\text{m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </div>

                    {/* After Collision Data with Diagram */}
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-3">After Collision</h5>
                      
                      {/* Collision Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Object 1 - simple circle (no arrow since velocity is unknown) */}
                          <circle cx="90" cy="40" r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                          
                          {/* Object 2 - simple circle */}
                          <circle cx="210" cy="40" r="18" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                          
                          {/* Momentum arrow for object 2 only */}
                          <defs>
                            <marker id="arrowhead4" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                              <polygon points="0 0, 6 2, 0 4" fill="#000000"/>
                            </marker>
                          </defs>
                          <line x1="230" y1="40" x2="250" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead4)"/>
                        </svg>
                      </div>

                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_1 ='}</InlineMath></div>
                          <div><InlineMath>{'2.00~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_1\' ='}</InlineMath></div>
                          <div><InlineMath>{'?'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_2 ='}</InlineMath></div>
                          <div><InlineMath>{'3.00~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_2\' ='}</InlineMath></div>
                          <div><InlineMath>{'+1.25~\\text{m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ol className="list-decimal pl-6 space-y-4">
                  <li>
                    <strong>Apply Conservation of Momentum:</strong>
                    <div className="pl-4 mt-2">
                      <p className="mb-2">When we apply the conservation of momentum principle we want the equation to reflect the context of the question. In this question there are two objects before the collision and two objects after the collision. Therefore there are two momentum terms on the before side and two momentum terms on the after side.</p>
                      <div className="text-center mb-3">
                        <BlockMath>{'m_1v_1 + m_2v_2 = m_1v_1\' + m_2v_2\''}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Rearrange to solve for v₁′:</strong>
                    <div className="pl-4 mt-2">
                      <p className="mb-2">Rearrange the equation, plug in the known values, and calculate the unknown.</p>
                      <div className="space-y-2">
                        <BlockMath>{'m_1v_1 + m_2v_2 = m_1v_1\' + m_2v_2\''}</BlockMath>
                        <BlockMath>{'m_1v_1\' = m_1v_1 + m_2v_2 - m_2v_2\''}</BlockMath>
                        <BlockMath>{'v_1\' = \\frac{m_1v_1 + m_2v_2 - m_2v_2\'}{m_1}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute values:</strong>
                    <div className="pl-4 mt-2">
                      <div className="space-y-2">
                        <BlockMath>{'v_1\' = \\frac{(2.00)(4.00) + (3.00)(-1.50) - (3.00)(1.25)}{2.00}'}</BlockMath>
                        <BlockMath>{'v_1\' = \\frac{8.00 - 4.50 - 3.75}{2.00}'}</BlockMath>
                        <BlockMath>{'v_1\' = \\frac{-0.25}{2.00}'}</BlockMath>
                        <BlockMath>{'v_1\' = -0.13~\\text{m/s}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                    <li>
                    <strong>Final answer:</strong>
                    <p className="pl-4 mt-1">
                      The final velocity of the 2.00 kg object is <InlineMath>{'0.13~\\text{m/s}'}</InlineMath> west.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      



  <AIAccordion theme="blue">
    <AIAccordion.Item
      title="Example 4: Completely Inelastic Collision"
      value="example-4"
      onAskAI={onAIAccordionContent}
    >
      <p className="mb-4">
        This example demonstrates a completely inelastic collision where objects stick together after impact.
      </p>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-3">Problem:</h4>
        <p className="mb-4">
          A 30 kg object travelling at 45 m/s west collides with a 40 kg object at rest.  
          If the objects stick together on contact, what is the resulting velocity of the combined masses?
        </p>

        <div className="bg-white p-4 rounded border border-gray-100 mb-6">
          <p className="font-medium text-gray-700 mb-2">Solution:</p>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Collision */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3">Before Collision</h5>
              <div className="flex justify-center mb-4">
                <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                  <circle cx="75" cy="40" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                  <circle cx="225" cy="40" r="18" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                  <defs>
                    <marker id="arrow5" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#000"/>
                    </marker>
                  </defs>
                  <line x1="200" y1="40" x2="170" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow5)"/>
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>m₁ = </span><span>30 kg</span></div>
                <div className="flex justify-between"><span>v₁ = </span><span>-45 m/s</span></div>
                <div className="flex justify-between"><span>m₂ = </span><span>40 kg</span></div>
                <div className="flex justify-between"><span>v₂ = </span><span>0 m/s</span></div>
              </div>
            </div>
            {/* After Collision */}
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h5 className="font-semibold text-green-800 mb-3">After Collision</h5>
              <div className="flex justify-center mb-4">
                <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                  <circle cx="135" cy="40" r="18" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                  <circle cx="165" cy="40" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                  <defs>
                    <marker id="arrow6" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#000"/>
                    </marker>
                  </defs>
                  <line x1="110" y1="40" x2="80" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow6)"/>
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>m₁₂ = </span><span>70 kg</span></div>
                <div className="flex justify-between"><span>v₁₂ = </span><span>?</span></div>
              </div>
            </div>
          </div>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Conservation of Momentum:</strong>
              <div className="pl-4 mt-2 text-center">
                <BlockMath>{`m_1v_1 + m_2v_2 = m_{12}v_{12}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Rearrange:</strong>
              <div className="pl-4 mt-2">
                <BlockMath>{`v_{12} = \\frac{m_1v_1 + m_2v_2}{m_{12}}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Substitute:</strong>
              <div className="pl-4 mt-2 space-y-2">
                <BlockMath>{`v_{12} = \\frac{(30)(-45) + (40)(0)}{70}`}</BlockMath>
                <BlockMath>{`v_{12} = -19~\\text{m/s}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Answer:</strong>
              <p className="pl-4 mt-1">
                The combined masses move at <InlineMath>{`19~\\text{m/s}`}</InlineMath> west.
              </p>
            </li>
          </ol>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> Completely inelastic collisions conserve momentum but not kinetic energy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AIAccordion.Item>
  </AIAccordion>



  <AIAccordion theme="blue">
    <AIAccordion.Item
      title="Example 5: Finding Initial Velocity in Inelastic Collision"
      value="example-5"
      onAskAI={onAIAccordionContent}
    >
      <p className="mb-4">
        This example demonstrates how to find an unknown initial velocity in a completely inelastic collision.
      </p>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-3">Problem:</h4>
        <p className="mb-4">
          A 400 kg object travelling east at 50 m/s collides with a moving 50 kg object.  
          The masses stick together and move at 27.8 m/s east. What was the initial velocity of the 50 kg object?
        </p>

        <div className="bg-white p-4 rounded border border-gray-100 mb-6">
          <p className="font-medium text-gray-700 mb-2">Solution:</p>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3">Before Collision</h5>
              <div className="flex justify-center mb-4">
                <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                  <circle cx="75" cy="40" r="22" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                  <circle cx="225" cy="40" r="16" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                  <defs>
                    <marker id="arrow7" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0,6 2,0 4" fill="#000"/>
                    </marker>
                  </defs>
                  <line x1="100" y1="40" x2="130" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow7)"/>
                  <line x1="200" y1="40" x2="170" y2="40" stroke="#888" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow7)"/>
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>m₁ = </span><span>400 kg</span></div>
                <div className="flex justify-between"><span>v₁ = </span><span>+50 m/s</span></div>
                <div className="flex justify-between"><span>m₂ = </span><span>50 kg</span></div>
                <div className="flex justify-between"><span>v₂ = </span><span>?</span></div>
              </div>
            </div>
            {/* After */}
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h5 className="font-semibold text-green-800 mb-3">After Collision</h5>
              <div className="flex justify-center mb-4">
                <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                  <circle cx="135" cy="40" r="22" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                  <circle cx="165" cy="40" r="16" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                  <defs>
                    <marker id="arrow8" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0,6 2,0 4" fill="#000"/>
                    </marker>
                  </defs>
                  <line x1="190" y1="40" x2="220" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow8)"/>
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>m₁₂ = </span><span>450 kg</span></div>
                <div className="flex justify-between"><span>v₁₂ = </span><span>+27.8 m/s</span></div>
              </div>
            </div>
          </div>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Conservation of Momentum:</strong>
              <div className="pl-4 mt-2 text-center">
                <BlockMath>{`m_1v_1 + m_2v_2 = m_{12}v_{12}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Rearrange for v₂:</strong>
              <div className="pl-4 mt-2">
                <BlockMath>{`v_2 = \\frac{m_{12}v_{12} - m_1v_1}{m_2}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Substitute:</strong>
              <div className="pl-4 mt-2 space-y-2">
                <BlockMath>{`v_2 = \\frac{(450)(27.8) - (400)(50)}{50}`}</BlockMath>
                <BlockMath>{`v_2 = -1.50 \\times 10^2~\\text{m/s}`}</BlockMath>
              </div>
            </li>
            <li>
              <strong>Answer:</strong>
              <p className="pl-4 mt-1">
                The 50 kg object was moving at <InlineMath>{`1.5 \\times 10^2~\\text{m/s}`}</InlineMath> west.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </AIAccordion.Item>
  </AIAccordion>



  <AIAccordion theme="blue">
    <AIAccordion.Item
      title="Example 6: Elastic vs Inelastic Collision Analysis"
      value="example-6"
      onAskAI={onAIAccordionContent}
    >
      <p className="mb-4">
        This example demonstrates how to analyze a collision to determine final velocities, check if it's elastic, and understand energy conservation.
      </p>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-3">Problem:</h4>
        <p className="mb-4">
          A 2.00 kg object travelling east at 4.00 m/s collides with a 3.00 kg object travelling west at 1.50 m/s.  
          If the 3.00 kg object ends up travelling east at 2.10 m/s:
        </p>
        <div className="ml-4 mb-4 space-y-1">
          <p><strong>a.</strong> What is the final velocity of the 2.00 kg object?</p>
          <p><strong>b.</strong> Was the collision elastic?</p>
          <p><strong>c.</strong> Why is momentum always conserved while kinetic energy may not be?</p>
        </div>

        <div className="bg-white p-4 rounded border border-gray-100">
          {/* Part A */}
          <div className="mb-8">
            <h5 className="font-semibold text-lg mb-3 text-blue-800">Part A: Final Velocity</h5>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h6 className="font-semibold text-blue-800 mb-2">Before</h6>
                <div className="flex justify-center mb-4">
                  <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                    <circle cx="75" cy="40" r="18" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                    <circle cx="225" cy="40" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                    <defs>
                      <marker id="arrow9" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0,6 2,0 4" fill="#000"/>
                      </marker>
                    </defs>
                    <line x1="100" y1="40" x2="130" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow9)"/>
                    <line x1="200" y1="40" x2="170" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow9)"/>
                  </svg>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>m₁ = 2.00 kg</span><span>v₁ = +4.00 m/s</span></div>
                  <div className="flex justify-between"><span>m₂ = 3.00 kg</span><span>v₂ = -1.50 m/s</span></div>
                </div>
              </div>
              {/* After */}
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <h6 className="font-semibold text-green-800 mb-2">After</h6>
                <div className="flex justify-center mb-4">
                  <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                    <circle cx="75" cy="40" r="18" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                    <circle cx="225" cy="40" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                    <defs>
                      <marker id="arrow10" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0,6 2,0 4" fill="#000"/>
                      </marker>
                    </defs>
                    <line x1="50" y1="40" x2="20" y2="40" stroke="#888" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow10)"/>
                    <line x1="250" y1="40" x2="280" y2="40" stroke="#000" strokeWidth="3" markerEnd="url(#arrow10)"/>
                  </svg>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>v₁f = ?</span><span>?</span></div>
                  <div className="flex justify-between"><span>v₂f = +2.10 m/s</span><span></span></div>
                </div>
              </div>
            </div>

            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong>Momentum:</strong>
                <div className="pl-4 text-center">
                  <BlockMath>{`m_1v_{1i} + m_2v_{2i} = m_1v_{1f} + m_2v_{2f}`}</BlockMath>
                </div>
              </li>
              <li>
                <strong>Rearrange:</strong>
                <div className="pl-4 space-y-2">
                  <BlockMath>{`v_{1f} = \\frac{m_1v_{1i} + m_2v_{2i} - m_2v_{2f}}{m_1}`}</BlockMath>
                </div>
              </li>
              <li>
                <strong>Substitute:</strong>
                <div className="pl-4 space-y-2">
                  <BlockMath>{`v_{1f} = \\frac{(2.00)(4.00) + (3.00)(-1.50) - (3.00)(2.10)}{2.00}`}</BlockMath>
                  <BlockMath>{`v_{1f} = -1.40~\\text{m/s}`}</BlockMath>
                </div>
              </li>
              <li>
                <strong>Answer:</strong>
                <p className="pl-4 mt-1">
                  The 2.00 kg object ends up at <InlineMath>{`1.40~\\text{m/s}`}</InlineMath> west.
                </p>
              </li>
            </ol>
          </div>

          {/* Part B */}
          <div className="mb-8 border-t border-gray-200 pt-6">
            <h5 className="font-semibold text-lg mb-3 text-red-800">Part B: Elastic?</h5>
            <p className="mb-4">
              Compare kinetic energy before and after.
            </p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <BlockMath>{`KE_i = \\tfrac12(2)(4^2) + \\tfrac12(3)(1.5^2) = 19.4~J`}</BlockMath>
              </li>
              <li>
                <BlockMath>{`KE_f = \\tfrac12(2)(1.4^2) + \\tfrac12(3)(2.1^2) = 8.58~J`}</BlockMath>
              </li>
              <li>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  KE_f &lt; KE_i ⇒ collision is inelastic.
                </div>
              </li>
            </ol>
          </div>

          {/* Part C */}
          <div className="border-t border-gray-200 pt-6">
            <h5 className="font-semibold text-lg mb-3 text-orange-800">Part C: Why?</h5>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                Momentum is conserved by Newton’s 3rd Law—forces come in equal & opposite pairs.
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                Kinetic energy can convert into heat, sound, deformation—energy transforms, not disappears.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AIAccordion.Item>
  </AIAccordion>



      
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="02-momentum-one-dimension-collisions"
          course={course}
          onAIAccordionContent={onAIAccordionContent}
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q6',
              title: 'Question 6: Two-Object Collision with Rebound'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q7',
              title: 'Question 7: Ball Collision Elasticity'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q8',
              title: 'Question 8: Car-Truck Unknown Mass'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q9',
              title: 'Question 9: Football Tackle'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q10',
              title: 'Question 10: Arrow and Apple'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q11',
              title: 'Question 11: Truck-Car Head-On Collision'
            }
          ]}
          theme="blue"
          onComplete={(score, results) => {
            console.log(`Collision Practice completed with ${score}% score`);
          }}
        />
      

      
          <AIAccordion theme="purple">
    <AIAccordion.Item
      title="Explosions and Momentum Conservation"
      value="example-explosions"
      onAskAI={onAIAccordionContent}
    >
      
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  An explosion is essentially the opposite of a completely inelastic collision. An object at rest 
                  breaks apart into multiple pieces that move in different directions, while still conserving momentum.
                </p>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Important Note:</h4>
                  <p className="text-purple-900">
                    While momentum is conserved in explosions, kinetic energy is <strong>not</strong> conserved. 
                    Internal energy is converted to kinetic energy of the fragments.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
  </AIAccordion>    

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Example 7: Rifle Recoil Problem"
            value="example-7-rifle-recoil"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              This example demonstrates how conservation of momentum applies to recoil situations where initial momentum is zero.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg mb-3">Problem:</h4>
              <p className="mb-4">
                A 5.0 kg rifle fires a 0.020 kg bullet to the east. If the muzzle speed of the bullet is 400 m/s, 
                what is the recoil velocity of the rifle?
              </p>
              
              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">Solution:</p>
                
                {/* Data Summary Tables with Integrated Diagrams */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Firing Data with Diagram */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h6 className="font-semibold text-blue-800 mb-3">Before Firing</h6>
                      {/* Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Rifle with bullet inside - shown as combined object at rest */}
                          <rect x="120" y="30" width="60" height="20" fill="#8b5a2b" stroke="#654321" strokeWidth="2" rx="3"/>
                          <text x="150" y="45" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">Rifle+Bullet</text>
                          <text x="150" y="65" fill="#000000" fontSize="9" textAnchor="middle">v = 0 m/s</text>
                        </svg>
                      </div>

                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'m_{rifle} ='}</InlineMath></div>
                          <div><InlineMath>{'5.0~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'m_{bullet} ='}</InlineMath></div>
                          <div><InlineMath>{'0.020~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'v_{initial} ='}</InlineMath></div>
                          <div><InlineMath>{'0~\\text{m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </div>

                    {/* After Firing Data with Diagram */}
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h6 className="font-semibold text-green-800 mb-3">After Firing</h6>
                      {/* Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Bullet moving east */}
                          <circle cx="220" cy="40" r="8" fill="#ff6b6b" stroke="#dc2626" strokeWidth="2"/>
                          <text x="220" y="55" fill="#000000" fontSize="8" textAnchor="middle">Bullet</text>
                          
                          {/* Rifle moving west */}
                          <rect x="60" y="30" width="50" height="20" fill="#8b5a2b" stroke="#654321" strokeWidth="2" rx="3"/>
                          <text x="85" y="55" fill="#000000" fontSize="8" textAnchor="middle">Rifle</text>
                          
                          {/* Velocity arrows */}
                          <defs>
                            <marker id="arrowhead10" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                              <polygon points="0 0, 6 2, 0 4" fill="#000000"/>
                            </marker>
                          </defs>
                          {/* Bullet arrow (east) */}
                          <line x1="240" y1="40" x2="270" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead10)"/>
                          <text x="255" y="30" fill="#000000" fontSize="9" textAnchor="middle">400 m/s</text>
                          
                          {/* Rifle arrow (west) */}
                          <line x1="50" y1="40" x2="20" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead10)"/>
                          <text x="35" y="30" fill="#000000" fontSize="9" textAnchor="middle">v = ?</text>
                        </svg>
                      </div>

                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'m_{rifle} ='}</InlineMath></div>
                          <div><InlineMath>{'5.0~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'m_{bullet} ='}</InlineMath></div>
                          <div><InlineMath>{'0.020~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'v_{bullet} ='}</InlineMath></div>
                          <div><InlineMath>{'+400~\\text{m/s}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-24"><InlineMath>{'v_{rifle} ='}</InlineMath></div>
                          <div><InlineMath>{'?'}</InlineMath></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ol className="list-decimal pl-6 space-y-4">
                  <li>
                    <strong>Apply Conservation of Momentum:</strong>
                    <div className="pl-4 mt-2">
                      <p className="mb-2">Since the rifle and bullet start at rest, the initial momentum is zero. After firing, the total momentum must still be zero.</p>
                      <div className="text-center mb-3">
                        <BlockMath>{'p_{initial} = p_{final}'}</BlockMath>
                        <BlockMath>{'0 = m_{rifle}v_{rifle} + m_{bullet}v_{bullet}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Rearrange to solve for rifle velocity:</strong>
                    <div className="pl-4 mt-2">
                      <div className="space-y-2">
                        <BlockMath>{'m_{rifle}v_{rifle} = -m_{bullet}v_{bullet}'}</BlockMath>
                        <BlockMath>{'v_{rifle} = -\\frac{m_{bullet}v_{bullet}}{m_{rifle}}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute values:</strong>
                    <div className="pl-4 mt-2">
                      <div className="space-y-2">
                        <BlockMath>{'v_{rifle} = -\\frac{(0.020~\\text{kg})(400~\\text{m/s})}{5.0~\\text{kg}}'}</BlockMath>
                        <BlockMath>{'v_{rifle} = -\\frac{8.0~\\text{kg}\\cdot\\text{m/s}}{5.0~\\text{kg}}'}</BlockMath>
                        <BlockMath>{'v_{rifle} = -1.6~\\text{m/s}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Final answer:</strong>
                    <p className="pl-4 mt-1">
                      The recoil velocity of the rifle is <InlineMath>{'1.6~\\text{m/s}'}</InlineMath> west 
                      (the negative sign indicates it recoils in the opposite direction to the bullet's motion).
                    </p>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Key Concept:</strong> This problem demonstrates that when the initial momentum of a system is zero, 
                      the final momentum must also be zero. The rifle and bullet acquire equal and opposite momenta, 
                      which is why the rifle recoils backward when the bullet is fired forward. This is a practical 
                      application of Newton's third law and conservation of momentum.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Example 8: Bomb Explosion Problem"
            value="example-8-bomb-explosion"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              This example demonstrates how conservation of momentum applies to explosion problems where an object breaks apart.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg mb-3">Problem:</h4>
              <p className="mb-4">
                A 4.00 kg bomb is rolling across a floor at 3.00 m/s to the east. After the bomb explodes, 
                a 1.50 kg piece has a velocity of 15.0 m/s east. What is the velocity of the other piece?
              </p>
              
              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">Solution:</p>
                
                {/* Data Summary Tables with Integrated Diagrams */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Explosion Data with Diagram */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h6 className="font-semibold text-blue-800 mb-3">Before Explosion</h6>
                      {/* Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Bomb moving east */}
                          <circle cx="150" cy="40" r="25" fill="#ff6b6b" stroke="#dc2626" strokeWidth="2"/>
                          <text x="150" y="40" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">4.00kg</text>
                          <text x="150" y="50" fill="white" fontSize="8" textAnchor="middle">Bomb</text>
                            {/* Arrow showing movement east */}
                          <defs>
                            <marker id="arrowhead11" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#000000"/>
                            </marker>
                          </defs>
                          <line x1="180" y1="40" x2="220" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead11)"/>
                          <text x="200" y="30" fill="#000000" fontSize="9" textAnchor="middle">3.00 m/s</text>
                        </svg>
                      </div>

                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_{total} ='}</InlineMath></div>
                          <div><InlineMath>{'4.00~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_{initial} ='}</InlineMath></div>
                          <div><InlineMath>{'+3.00~\\text{m/s}'}</InlineMath></div>
                        </div>
                      </div>
                    </div>

                    {/* After Explosion Data with Diagram */}
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h6 className="font-semibold text-green-800 mb-3">After Explosion</h6>
                      {/* Diagram */}
                      <div className="flex justify-center mb-4">
                        <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                          {/* Piece 1 moving east */}
                          <circle cx="200" cy="30" r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                          <text x="200" y="30" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">1.50kg</text>
                          
                          {/* Piece 2 with unknown velocity */}
                          <circle cx="100" cy="50" r="18" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
                          <text x="100" y="50" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">2.50kg</text>
                          
                          {/* Arrow for piece 1 (east) */}
                          <line x1="220" y1="30" x2="250" y2="30" stroke="#000000" strokeWidth="2" markerEnd="url(#arrowhead11)"/>
                          <text x="235" y="20" fill="#000000" fontSize="8" textAnchor="middle">15.0 m/s</text>
                          
                          {/* Arrow for piece 2 (unknown direction) */}
                          <line x1="75" y1="50" x2="45" y2="50" stroke="#000000" strokeWidth="2" markerEnd="url(#arrowhead11)"/>
                          <text x="60" y="40" fill="#000000" fontSize="8" textAnchor="middle">v = ?</text>
                        </svg>
                      </div>

                      {/* Data Values */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_1 ='}</InlineMath></div>
                          <div><InlineMath>{'1.50~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_1 ='}</InlineMath></div>
                          <div><InlineMath>{'+15.0~\\text{m/s}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'m_2 ='}</InlineMath></div>
                          <div><InlineMath>{'2.50~\\text{kg}'}</InlineMath></div>
                        </div>
                        <div className="flex items-baseline">
                          <div className="w-20"><InlineMath>{'v_2 ='}</InlineMath></div>
                          <div><InlineMath>{'?'}</InlineMath></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ol className="list-decimal pl-6 space-y-4">
                  <li>
                    <strong>Apply Conservation of Momentum:</strong>
                    <div className="pl-4 mt-2">
                      <p className="mb-2">The total momentum before the explosion equals the total momentum after the explosion.</p>
                      <div className="text-center mb-3">
                        <BlockMath>{'p_{before} = p_{after}'}</BlockMath>
                        <BlockMath>{'m_{total}v_{initial} = m_1v_1 + m_2v_2'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Determine the mass of piece 2:</strong>
                    <div className="pl-4 mt-2">
                      <p className="mb-2">Since the bomb breaks into two pieces:</p>
                      <div className="space-y-2">
                        <BlockMath>{'m_2 = m_{total} - m_1'}</BlockMath>
                        <BlockMath>{'m_2 = 4.00~\\text{kg} - 1.50~\\text{kg} = 2.50~\\text{kg}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Rearrange to solve for v₂:</strong>
                    <div className="pl-4 mt-2">
                      <div className="space-y-2">
                        <BlockMath>{'m_2v_2 = m_{total}v_{initial} - m_1v_1'}</BlockMath>
                        <BlockMath>{'v_2 = \\frac{m_{total}v_{initial} - m_1v_1}{m_2}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute values:</strong>
                    <div className="pl-4 mt-2">
                      <div className="space-y-2">
                        <BlockMath>{'v_2 = \\frac{(4.00~\\text{kg})(3.00~\\text{m/s}) - (1.50~\\text{kg})(15.0~\\text{m/s})}{2.50~\\text{kg}}'}</BlockMath>
                        <BlockMath>{'v_2 = \\frac{12.0~\\text{kg}\\cdot\\text{m/s} - 22.5~\\text{kg}\\cdot\\text{m/s}}{2.50~\\text{kg}}'}</BlockMath>
                        <BlockMath>{'v_2 = \\frac{-10.5~\\text{kg}\\cdot\\text{m/s}}{2.50~\\text{kg}}'}</BlockMath>
                        <BlockMath>{'v_2 = -4.20~\\text{m/s}'}</BlockMath>
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Final answer:</strong>
                    <p className="pl-4 mt-1">
                      The velocity of the other piece is <InlineMath>{'4.20~\\text{m/s}'}</InlineMath> west 
                      (the negative sign indicates it moves in the opposite direction to our chosen positive direction).
                    </p>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Key Concept:</strong> This problem demonstrates conservation of momentum in explosions. 
                      The bomb initially has momentum to the east, so the total momentum of the fragments must also 
                      equal this initial momentum. Since one piece flies east faster than the original speed, the other 
                      piece must fly west to conserve momentum. This is similar to the rifle-bullet problem, but here 
                      the system had initial momentum before the explosion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="Example 9: Two-Part Problem - Collision and Incline"
            value="example-9-collision-incline"
            onAskAI={onAIAccordionContent}
          >
            <p className="mb-4">
              This example demonstrates how momentum and energy conservation can be combined to solve multi-step problems.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg mb-3">Problem:</h4>
                <p className="mb-4">
                  Ball A (2.0 kg) moving at 5.0 m/s east collides with stationary ball B (3.0 kg). After the collision, 
                  ball A moves at 1.0 m/s east. Ball B then rolls up a 20° incline.
                </p>
                <p className="mb-4 text-gray-700">
                  <strong>Part A:</strong> Find the velocity of ball B immediately after the collision.<br/>
                  <strong>Part B:</strong> Find the maximum height ball B reaches on the incline.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-2">Solution:</p>
                  
                  {/* Part A - Collision Analysis */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold text-blue-800 mb-4">Part A: Find velocity of ball B after collision</h5>
                    
                    {/* Collision Diagrams and Data */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Before Collision */}
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                          <h6 className="font-semibold text-blue-800 mb-3">Before Collision</h6>
                          {/* Diagram */}
                          <div className="flex justify-center mb-4">
                            <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                              {/* Ball A moving east */}
                              <circle cx="100" cy="40" r="22" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                              <text x="100" y="46" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">A: 2kg</text>
                              
                              {/* Ball B stationary */}
                              <circle cx="200" cy="40" r="25" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                              <text x="200" y="46" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">B: 3kg</text>
                              
                              {/* Arrow for Ball A */}
                              <defs>
                                <marker id="arrowhead12" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                  <polygon points="0 0, 8 3, 0 6" fill="#000000"/>
                                </marker>
                              </defs>
                              <line x1="130" y1="40" x2="160" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead12)"/>
                              <text x="145" y="30" fill="#000000" fontSize="9" textAnchor="middle">5.0 m/s</text>
                              
                              {/* Stationary label for Ball B */}
                              <text x="200" y="65" fill="#000000" fontSize="9" textAnchor="middle">v = 0</text>
                            </svg>
                          </div>                          {/* Data Values */}
                          <div className="space-y-2">
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'m_A ='}</InlineMath></div>
                              <div><InlineMath>{'2.0~\\text{kg}'}</InlineMath></div>
                            </div>                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'v_A ='}</InlineMath></div>
                              <div><InlineMath>{'+5.0~\\text{m/s}'}</InlineMath></div>
                            </div>
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'m_B ='}</InlineMath></div>
                              <div><InlineMath>{'3.0~\\text{kg}'}</InlineMath></div>
                            </div>
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'v_B ='}</InlineMath></div>
                              <div><InlineMath>{'0~\\text{m/s}'}</InlineMath></div>
                            </div>
                          </div>
                        </div>

                        {/* After Collision */}
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                          <h6 className="font-semibold text-green-800 mb-3">After Collision</h6>
                          {/* Diagram */}
                          <div className="flex justify-center mb-4">
                            <svg width="300" height="80" viewBox="0 0 300 80" className="border border-gray-300 bg-white rounded">
                              {/* Ball A after collision */}
                              <circle cx="120" cy="40" r="22" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
                              <text x="120" y="46" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">A: 2kg</text>
                              
                              {/* Ball B after collision */}
                              <circle cx="210" cy="40" r="25" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
                              <text x="210" y="46" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">B: 3kg</text>
                              
                              {/* Arrow for Ball A */}
                              <line x1="145" y1="40" x2="165" y2="40" stroke="#000000" strokeWidth="2" markerEnd="url(#arrowhead12)"/>
                              <text x="155" y="30" fill="#000000" fontSize="8" textAnchor="middle">1.0 m/s</text>
                              
                              {/* Arrow for Ball B (unknown) */}
                              <line x1="235" y1="40" x2="270" y2="40" stroke="#000000" strokeWidth="3" markerEnd="url(#arrowhead12)"/>
                              <text x="252" y="30" fill="#000000" fontSize="8" textAnchor="middle">v = ?</text>
                            </svg>
                          </div>                          {/* Data Values */}
                          <div className="space-y-2">
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'m_A ='}</InlineMath></div>
                              <div><InlineMath>{'2.0~\\text{kg}'}</InlineMath></div>
                            </div>
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'v_A\' ='}</InlineMath></div>
                              <div><InlineMath>{'+1.0~\\text{m/s}'}</InlineMath></div>
                            </div>
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'m_B ='}</InlineMath></div>
                              <div><InlineMath>{'3.0~\\text{kg}'}</InlineMath></div>
                            </div>
                            <div className="flex items-baseline">
                              <div className="w-20"><InlineMath>{'v_B\' ='}</InlineMath></div>
                              <div><InlineMath>{'?'}</InlineMath></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ol className="list-decimal pl-6 space-y-4 mb-6">
                      <li>
                        <strong>Apply Conservation of Momentum:</strong>
                        <div className="pl-4 mt-2">
                          <p className="mb-2">The total momentum before collision equals the total momentum after collision.</p>                          <div className="text-center mb-3">
                            <BlockMath>{'p_{before} = p_{after}'}</BlockMath>
                            <BlockMath>{'m_A v_A + m_B v_B = m_A v_A\' + m_B v_B\''}</BlockMath>
                          </div>
                        </div>
                      </li>
                        <li>
                        <strong>Rearrange to solve for v<sub>B'</sub>:</strong>
                        <div className="pl-4 mt-2">
                          <div className="space-y-2">
                            <BlockMath>{'m_B v_B\' = m_A v_A + m_B v_B - m_A v_A\''}</BlockMath>
                            <BlockMath>{'v_B\' = \\frac{m_A v_A + m_B v_B - m_A v_A\'}{m_B}'}</BlockMath>
                          </div>
                        </div>
                      </li>
                        <li>
                        <strong>Substitute values:</strong>
                        <div className="pl-4 mt-2">
                          <div className="space-y-2">
                            <BlockMath>{'v_B\' = \\frac{(2.0)(5.0) + (3.0)(0) - (2.0)(1.0)}{3.0}'}</BlockMath>
                            <BlockMath>{'v_B\' = \\frac{10.0 + 0 - 2.0}{3.0}'}</BlockMath>
                            <BlockMath>{'v_B\' = \\frac{8.0}{3.0}'}</BlockMath>
                            <BlockMath>{'v_B\' = 2.67~\\text{m/s}'}</BlockMath>
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                      <p className="text-green-800">
                        <strong>Answer for Part A:</strong> Ball B moves at 2.67 m/s east immediately after the collision.
                      </p>
                    </div>
                  </div>

                  {/* Part B - Energy Conservation on Incline */}
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-purple-800 mb-4">Part B: Find maximum height on incline</h5>
                    
                    {/* Incline Diagram */}
                    <div className="mb-6">
                      <div className="bg-purple-50 p-4 rounded border border-purple-200">
                        <h6 className="font-semibold text-purple-800 mb-3">Ball B on 20° Incline</h6>
                        <div className="flex justify-center mb-4">
                          <svg width="400" height="200" viewBox="0 0 400 200" className="border border-gray-300 bg-white rounded">                            {/* Incline */}
                            <line x1="50" y1="150" x2="350" y2="50" stroke="#8b5cf6" strokeWidth="4"/>
                            
                            {/* Ball at top (dashed) */}
                            <circle cx="280" cy="75" r="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4"/>
                            <text x="280" y="80" fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">B</text>
                            
                            {/* Velocity arrow at bottom */}
                            <line x1="100" y1="135" x2="130" y2="135" stroke="#000000" strokeWidth="2" markerEnd="url(#arrowhead12)"/>
                            <text x="115" y="125" fill="#000000" fontSize="8" textAnchor="middle">2.67 m/s</text>
                            
                            {/* Height line */}
                            <line x1="80" y1="135" x2="280" y2="135" stroke="#000000" strokeWidth="1" strokeDasharray="2,2"/>
                            <line x1="280" y1="75" x2="280" y2="135" stroke="#000000" strokeWidth="2"/>
                            <text x="290" y="105" fill="#000000" fontSize="10" fontWeight="bold">h = ?</text>
                              {/* Angle marking */}
                            <path d="M 50 150 L 80 150 A 30 30 0 0 0 72 138" stroke="#8b5cf6" strokeWidth="2" fill="none"/>
                            <text x="85" y="145" fill="#8b5cf6" fontSize="10" fontWeight="bold">20°</text>
                            
                            {/* Ground line */}
                            <line x1="30" y1="150" x2="380" y2="150" stroke="#654321" strokeWidth="3"/>
                          </svg>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline">
                            <div className="w-32"><InlineMath>{'\\text{Initial velocity} ='}</InlineMath></div>
                            <div><InlineMath>{'2.67~\\text{m/s}'}</InlineMath></div>
                          </div>
                          <div className="flex items-baseline">
                            <div className="w-32"><InlineMath>{'\\text{Final velocity} ='}</InlineMath></div>
                            <div><InlineMath>{'0~\\text{m/s}'}</InlineMath> (at maximum height)</div>
                          </div>
                          <div className="flex items-baseline">
                            <div className="w-32"><InlineMath>{'\\text{Incline angle} ='}</InlineMath></div>
                            <div><InlineMath>{'20°'}</InlineMath></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ol className="list-decimal pl-6 space-y-4 mb-6">
                      <li>
                        <strong>Apply Conservation of Energy:</strong>
                        <div className="pl-4 mt-2">
                          <p className="mb-2">As ball B rolls up the incline, kinetic energy converts to gravitational potential energy.</p>
                          <div className="text-center mb-3">
                            <BlockMath>{'KE_{initial} + PE_{initial} = KE_{final} + PE_{final}'}</BlockMath>
                            <BlockMath>{'\\frac{1}{2}mv_0^2 + 0 = 0 + mgh'}</BlockMath>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Simplify and solve for height:</strong>
                        <div className="pl-4 mt-2">
                          <p className="mb-2">Since the ball starts at ground level (PE_initial = 0) and comes to rest at maximum height (KE_final = 0):</p>
                          <div className="space-y-2">
                            <BlockMath>{'\\frac{1}{2}mv_0^2 = mgh'}</BlockMath>
                            <BlockMath>{'\\frac{1}{2}v_0^2 = gh'}</BlockMath>
                            <BlockMath>{'h = \\frac{v_0^2}{2g}'}</BlockMath>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Substitute values:</strong>
                        <div className="pl-4 mt-2">
                          <p className="mb-2">Using g = 9.8 m/s² and v₀ = 2.67 m/s:</p>
                          <div className="space-y-2">
                            <BlockMath>{'h = \\frac{(2.67)^2}{2(9.8)}'}</BlockMath>
                            <BlockMath>{'h = \\frac{7.13}{19.6}'}</BlockMath>
                            <BlockMath>{'h = 0.364~\\text{m}'}</BlockMath>
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                      <p className="text-purple-800">
                        <strong>Answer for Part B:</strong> Ball B reaches a maximum height of 0.364 m (or 36.4 cm) above the base of the incline.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Key Concept:</strong> This problem demonstrates how conservation laws work together in multi-step problems. 
                        First, we use conservation of momentum to analyze the collision and find the velocity of ball B. 
                        Then, we use conservation of energy to determine how high ball B rises on the incline. 
                        This approach is fundamental in physics - breaking complex problems into simpler parts and applying 
                        the appropriate conservation law for each step.
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
      

      
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="02-momentum-one-dimension-advanced"
          course={course}
          onAIAccordionContent={onAIAccordionContent}
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q12',
              title: 'Question 12: Astronaut Recoil'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q13',
              title: 'Question 13: Rocket Separation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q14',
              title: 'Question 14: Machine Gun Recoil'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q15',
              title: 'Question 15: Uranium Disintegration'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q16',
              title: 'Question 16: Ballistic Pendulum'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q17',
              title: 'Question 17: Canoe Ball Throwing'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q18',
              title: 'Question 18: Cart Jumping'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_02_momentum_one_dimension_kc_q19',
              title: 'Question 19: Elastic Atomic Collision'
            }
          ]}
          theme="blue"
          onComplete={(score, results) => {
            console.log(`Advanced Practice completed with ${score}% score`);
          }}
        />
      

      <LessonSummary
        points={[
          "Linear momentum is the product of mass and velocity (p = mv)",
          "The total momentum of a closed system remains constant",
          "Conservation of momentum is especially useful for analyzing collisions",
          "Different types of collisions conserve different physical quantities",
          "Understanding momentum is crucial for solving real-world physics problems"
        ]}
      />
    </LessonContent>
  );
};

export default MomentumOneDimension;
