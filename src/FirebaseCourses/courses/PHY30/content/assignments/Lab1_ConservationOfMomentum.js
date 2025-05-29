import React, { useState } from 'react';

/**
 * Lab 1 - Conservation of Momentum for Physics 30
 * Item ID: assignment_1747283296776_954
 * Unit: Momentum and Energy
 */
const Lab1_ConservationOfMomentum = () => {  // Track completion status for each section
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started', // 'not-started', 'in-progress', 'completed'
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    error: 'not-started',
    conclusion: 'not-started'  });
  
  // Track section content
  const [sectionContent, setSectionContent] = useState({
    hypothesis: ''
  });
  // Simulation state
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    hasBeenStarted: false, // Track if simulation has been started (even after it finishes)
    showTrails: true,    collisionType: '1D', // '1D' or '2D'
    puck1: { x: 120, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 }, // Initial position on left side of puck2
    puck2: { x: 300, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 },
    hasCollided: false,
    trials: [],
    launchAngle: 0, // angle in degrees for puck 1 trajectory
    sparkTrail: [], // array of position dots
    frameCounter: 0, // to track frames for spark dots
    pucksVisible: true,
    simulationEndTime: null,    // Data tracking for before/after collision analysis
    beforeCollision: {
      puck1: { vx: 0, vy: 0, mass: 505 },
      puck2: { vx: 0, vy: 0, mass: 505 }
    },
    afterCollision: {
      puck1: { vx: 0, vy: 0, mass: 505 },
      puck2: { vx: 0, vy: 0, mass: 505 }
    }
  });
  
  const [animationId, setAnimationId] = useState(null);
  const [currentSection, setCurrentSection] = useState('hypothesis');
  const [labStarted, setLabStarted] = useState(false);
  const startLab = () => {
    setLabStarted(true);
    // Scroll to hypothesis section after a brief delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById('section-hypothesis');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  const saveAndEnd = () => {
    setLabStarted(false);
    // Here you could also save progress to database
  };
  const updateSectionContent = (section, content) => {
    setSectionContent(prev => ({
      ...prev,
      [section]: content
    }));
    
    // Update status based on content
    if (content.trim().length > 0) {
      let isCompleted = false;
      
      if (section === 'hypothesis') {
        // Check for required words: if, then, because
        const lowerContent = content.toLowerCase();
        const hasIf = lowerContent.includes('if');
        const hasThen = lowerContent.includes('then');
        const hasBecause = lowerContent.includes('because');
        isCompleted = hasIf && hasThen && hasBecause && content.trim().length > 20;
      } else {
        isCompleted = content.trim().length > 20;
      }
      
      setSectionStatus(prev => ({
        ...prev,
        [section]: isCompleted ? 'completed' : 'in-progress'
      }));
    } else {
      setSectionStatus(prev => ({
        ...prev,
        [section]: 'not-started'
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'in-progress':
        return <span className="text-yellow-500">⚠</span>;
      default:
        return <span className="text-gray-300">○</span>;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }  };

  // Helper functions for data analysis
  const calculateSpeed = (vx, vy) => {
    return Math.sqrt(vx * vx + vy * vy);
  };

  const calculateAngleFromHorizontal = (vx, vy) => {
    if (vx === 0 && vy === 0) return 0;
    const angleRad = Math.atan2(vy, vx);
    const angleDeg = angleRad * (180 / Math.PI);
    return Math.abs(angleDeg);
  };
  // Scale conversion: Define how many pixels equal 1 cm
  // This creates a realistic physics lab scale where the 500px wide canvas represents about 50cm
  const PIXELS_PER_CM = 10; // 10 pixels = 1 cm
    const calculateSparkDotSpacing = (vx, vy) => {
    // Spark dots are placed every 6 frames at 60fps (1/10 second intervals)
    // Distance = speed × frames between dots
    const speed = calculateSpeed(vx, vy);
    return speed * 6; // Distance between spark dots in pixels (6 frames apart)
  };  const calculateSparkDotSpacingCm = (vx, vy) => {
    // Calculate spacing in pixels first, then convert to centimeters
    const spacingPx = calculateSparkDotSpacing(vx, vy);
    return spacingPx / PIXELS_PER_CM; // Convert pixels to centimeters
  };

  // Physics simulation functions
  const checkCollision = (puck1, puck2) => {
    const dx = puck1.x - puck2.x;
    const dy = puck1.y - puck2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (puck1.radius + puck2.radius);
  };
  const handleCollision = (p1, p2) => {
    // Calculate collision response using conservation of momentum
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Avoid division by zero
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity in collision normal direction
    const dvx = p1.vx - p2.vx;
    const dvy = p1.vy - p2.vy;
    const dvn = dvx * nx + dvy * ny;
    
    // Do not resolve if velocities are separating
    if (dvn > 0) return;
    
    // Add realistic coefficient of restitution variation
    // For physics pucks, coefficient of restitution is typically 0.85-0.95
    const baseRestitution = 0.9;
    const restitutionVariation = 0.05; // ±5% variation
    const restitutionError = (Math.random() - 0.5) * 2 * restitutionVariation;
    const coefficientOfRestitution = baseRestitution + restitutionError;
    
    // Collision impulse with coefficient of restitution
    const impulse = (1 + coefficientOfRestitution) * dvn / (p1.mass + p2.mass);
    
    // Update velocities
    p1.vx -= impulse * p2.mass * nx;
    p1.vy -= impulse * p2.mass * ny;
    p2.vx += impulse * p1.mass * nx;
    p2.vy += impulse * p1.mass * ny;
    
    // Separate pucks to avoid overlap
    const overlap = (p1.radius + p2.radius) - distance;
    const separationX = nx * overlap * 0.5;
    const separationY = ny * overlap * 0.5;
    
    p1.x += separationX;
    p1.y += separationY;
    p2.x -= separationX;
    p2.y -= separationY;
  };
  const animate = () => {
    setSimulationState(prev => {
      const newState = { ...prev };
      const p1 = { ...newState.puck1 };
      const p2 = { ...newState.puck2 };
      
      // Update frame counter
      newState.frameCounter = (newState.frameCounter || 0) + 1;
        // Add spark trail dots every 6 frames (approximately 1/10 second at 60fps)
      if (newState.frameCounter % 6 === 0) {
        newState.sparkTrail = [...(newState.sparkTrail || []), {
          puck1: { x: p1.x, y: p1.y },
          puck2: { x: p2.x, y: p2.y },
          timestamp: Date.now()
        }];
        
        // Keep only last 200 spark dots to prevent memory issues while preserving longer trails
        if (newState.sparkTrail.length > 200) {
          newState.sparkTrail = newState.sparkTrail.slice(-200);
        }
      }
      
      // Update positions
      p1.x += p1.vx;
      p1.y += p1.vy;
      p2.x += p2.vx;
      p2.y += p2.vy;
      
      // Boundary collisions (canvas is 500x400)
      if (p1.x <= p1.radius || p1.x >= 500 - p1.radius) {
        p1.vx *= -0.8; // Some energy loss
        p1.x = Math.max(p1.radius, Math.min(500 - p1.radius, p1.x));
      }
      if (p1.y <= p1.radius || p1.y >= 400 - p1.radius) {
        p1.vy *= -0.8;
        p1.y = Math.max(p1.radius, Math.min(400 - p1.radius, p1.y));
      }
      if (p2.x <= p2.radius || p2.x >= 500 - p2.radius) {
        p2.vx *= -0.8;
        p2.x = Math.max(p2.radius, Math.min(500 - p2.radius, p2.x));
      }
      if (p2.y <= p2.radius || p2.y >= 400 - p2.radius) {
        p2.vy *= -0.8;
        p2.y = Math.max(p2.radius, Math.min(400 - p2.radius, p2.y));
      }      // Check for collision between pucks
      if (checkCollision(p1, p2)) {
        // Capture before collision data only for the first collision
        if (!newState.hasCollided) {
          newState.beforeCollision = {
            puck1: { vx: p1.vx, vy: p1.vy, mass: p1.mass },
            puck2: { vx: p2.vx, vy: p2.vy, mass: p2.mass }
          };
        }
        
        handleCollision(p1, p2);
        
        // Capture after collision data only for the first collision
        if (!newState.hasCollided) {
          newState.hasCollided = true;
          newState.afterCollision = {
            puck1: { vx: p1.vx, vy: p1.vy, mass: p1.mass },
            puck2: { vx: p2.vx, vy: p2.vy, mass: p2.mass }
          };
        }
      }
      
      // Apply friction
      p1.vx *= 0.995;
      p1.vy *= 0.995;
      p2.vx *= 0.995;
      p2.vy *= 0.995;
      
      // Stop simulation if velocities are very low
      const totalKE = 0.5 * p1.mass * (p1.vx * p1.vx + p1.vy * p1.vy) + 
                     0.5 * p2.mass * (p2.vx * p2.vx + p2.vy * p2.vy);
      
      if (totalKE < 0.1 && newState.hasCollided) {
        p1.vx = 0;
        p1.vy = 0;
        p2.vx = 0;
        p2.vy = 0;
        newState.isRunning = false;
        newState.simulationEndTime = Date.now();
      }
      
      newState.puck1 = p1;
      newState.puck2 = p2;
      
      return newState;
    });
  };  const startSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Get current puck positions
    const puck1Pos = { x: simulationState.puck1.x, y: simulationState.puck1.y };
    const puck2Pos = { x: simulationState.puck2.x, y: simulationState.puck2.y };
    
    // Calculate direction vector from puck 1 to a point slightly to the right of puck 2's center
    // This creates more consistent glancing blows instead of head-on collisions
    const targetOffsetX = 25; // Aim 25 pixels to the right of puck 2's center
    const targetX = puck2Pos.x + targetOffsetX;
    const targetY = puck2Pos.y; // Keep same Y position
    
    const dx = targetX - puck1Pos.x;
    const dy = targetY - puck1Pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Add realistic random error variations to simulate real physics lab conditions
      // 1. Random speed variation (±15% launch speed error)
    const baseSpeed = 4;
    const speedVariation = 0.15; // ±15%
    const speedError = (Math.random() - 0.5) * 2 * speedVariation; // Random between -0.15 and +0.15
    const speed = baseSpeed * (1 + speedError);
    
    // 2. Random mass variations (±0.8% manufacturing tolerance)
    const baseMass = 505; // grams
    const massVariation = 0.008; // ±0.8%
    const mass1Error = (Math.random() - 0.5) * 2 * massVariation;
    const mass2Error = (Math.random() - 0.5) * 2 * massVariation;
    const puck1Mass = baseMass * (1 + mass1Error);
    const puck2Mass = baseMass * (1 + mass2Error);
      
    // Normalize direction and apply speed with variation
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
      setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      hasBeenStarted: true, // Mark that simulation has been started
      hasCollided: false,
      puck1: { 
        ...prev.puck1,
        vx: vx, 
        vy: vy, 
        mass: 505
      },      puck2: { 
        ...prev.puck2,
        vx: 0, 
        vy: 0, 
        mass: 505
      },
      // Set initial before collision data
      beforeCollision: {
        puck1: { vx: vx, vy: vy, mass: 505 },
        puck2: { vx: 0, vy: 0, mass: 505 }
      },
      // Reset after collision data
      afterCollision: {
        puck1: { vx: 0, vy: 0, mass: 505 },
        puck2: { vx: 0, vy: 0, mass: 505 }
      }
    }));
  };

  const stopSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    setSimulationState(prev => ({
      ...prev,
      isRunning: false
    }));
  };  const resetSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }    // Calculate initial position for puck 1 based on current angle
    const puck2Center = { x: 300, y: 200 };
    const circleCenter = { x: 400, y: 200 }; // Circle center moved further right for more pronounced glancing blows
    const radius = 300; // Moderate radius for good collision variety while keeping puck 1 well within screen bounds
    // Add 180° offset so angle 0° positions puck 1 on the left side
    const angleRad = ((simulationState.launchAngle + 180) * Math.PI) / 180;
    const initialPuck1X = circleCenter.x + radius * Math.cos(angleRad);
    const initialPuck1Y = circleCenter.y + radius * Math.sin(angleRad);setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      hasBeenStarted: false, // Reset the started flag so Start button becomes visible again
      hasCollided: false,
      puck1: { x: initialPuck1X, y: initialPuck1Y, vx: 0, vy: 0, mass: 505, radius: 20 },
      puck2: { x: 300, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 },
      sparkTrail: [], // Clear the spark trail on reset
      frameCounter: 0,
      pucksVisible: true,
      simulationEndTime: null
    }));
  };  const updateLaunchAngle = (angle) => {
    // Calculate circular position for puck 1 around a center point to the right of puck 2
    const puck2Center = { x: 300, y: 200 }; // Fixed position for puck 2
    const circleCenter = { x: 400, y: 200 }; // Circle center moved further right for more pronounced glancing blows
    const radius = 300; // Moderate radius for good collision variety while keeping puck 1 well within screen bounds
    // Add 180° so that angle 0° positions puck 1 on the left side
    const angleRad = ((angle + 180) * Math.PI) / 180;
    
    // Calculate new position for puck 1 on the circle
    const newPuck1X = circleCenter.x + radius * Math.cos(angleRad);
    const newPuck1Y = circleCenter.y + radius * Math.sin(angleRad);
    
    setSimulationState(prev => ({
      ...prev,
      launchAngle: angle,
      puck1: {
        ...prev.puck1,
        x: newPuck1X,
        y: newPuck1Y
      }
    }));
  };
  // Animation loop
  React.useEffect(() => {
    if (simulationState.isRunning) {
      const id = requestAnimationFrame(() => {
        animate();
        setAnimationId(id);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [simulationState.isRunning, simulationState.puck1, simulationState.puck2]);

  // Handle puck visibility after simulation ends
  React.useEffect(() => {
    if (simulationState.simulationEndTime && !simulationState.isRunning) {
      const timer = setTimeout(() => {
        setSimulationState(prev => ({
          ...prev,
          pucksVisible: false
        }));
      }, 5000); // Hide pucks 5 seconds after simulation ends

      return () => clearTimeout(timer);
    }
  }, [simulationState.simulationEndTime, simulationState.isRunning]);
  const scrollToSection = (sectionName) => {
    setCurrentSection(sectionName);
    const element = document.getElementById(`section-${sectionName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const inProgressCount = Object.values(sectionStatus).filter(status => status === 'in-progress').length;  // Show start lab screen if lab hasn't started
  if (!labStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Lab 1 - Conservation of Momentum</h1>
          {/* Introduction Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The purpose of this lab is to confirm if the law of conservation of momentum applies to 1-D and 2-D 
              collisions. Throughout the lab, keep in mind that you are not solving for any unknown; you will know 
              all the masses and all the velocities, and therefore all the momentums. What we want to examine is 
              whether or not the total initial momentum you measure at the start is the same as the total final 
              momentum at the end.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Also consider that although your final results will not have a 0% error (that 
              would be exceedingly rare!) you must make a reasonable judgment as to whether or not conservation 
              of momentum applied in your collisions.
            </p>
          </div>

          {/* Objective Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Objective</h2>
            <p className="text-gray-700 leading-relaxed">
              To determine if momentum is conserved during 1-D and 2-D collisions.
            </p>
          </div>
        </div>
          {/* Start Lab Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to Begin?</h2>
            <p className="text-gray-600 mb-4">
              This lab contains all parts of a lab report and an interactive simulation. You can save your progress and return later if needed.
            </p>            <button
              onClick={startLab}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200 text-lg"
            >
              Start Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lab 1 - Conservation of Momentum</h1>      {/* Combined Navigation & Progress */}
      <div className="sticky top-0 z-10 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'hypothesis', label: 'Hypothesis' },
                { key: 'procedure', label: 'Procedure' },
                { key: 'simulation', label: 'Simulation' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'error', label: 'Error' },
                { key: 'conclusion', label: 'Conclusion' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.key)}
                  className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                    sectionStatus[section.key] === 'completed'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : sectionStatus[section.key] === 'in-progress'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                      : currentSection === section.key 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{section.label}</span>
                  {sectionStatus[section.key] === 'completed' && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>

            {/* Save and End Button */}
            <button 
              onClick={saveAndEnd}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded border border-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Save and End
            </button>
          </div>
        </div>
      </div>      {/* Hypothesis Section */}
      <div id="section-hypothesis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.hypothesis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Hypothesis</span>
          {getStatusIcon(sectionStatus.hypothesis)}
        </h2>        <div className="space-y-4">
          <div>
            <label htmlFor="hypothesis-input" className="block text-sm font-medium text-gray-700 mb-2">
              Your Hypothesis:
            </label>
            <textarea
              id="hypothesis-input"
              value={sectionContent.hypothesis}
              onChange={(e) => updateSectionContent('hypothesis', e.target.value)}
              placeholder="If objects collide in a closed system, then..., because..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {sectionContent.hypothesis.length} characters
              </span>
              {(() => {
                const content = sectionContent.hypothesis.toLowerCase();
                const hasIf = content.includes('if');
                const hasThen = content.includes('then');
                const hasBecause = content.includes('because');
                const hasLength = sectionContent.hypothesis.trim().length > 20;
                
                if (hasIf && hasThen && hasBecause && hasLength) {
                  return <span className="text-xs text-green-600">✓ Complete hypothesis format</span>;
                } else if (sectionContent.hypothesis.trim().length > 0) {
                  const missing = [];
                  if (!hasIf) missing.push('if');
                  if (!hasThen) missing.push('then');
                  if (!hasBecause) missing.push('because');
                  
                  if (missing.length > 0) {
                    return <span className="text-xs text-yellow-600">Need: {missing.join(', ')}</span>;
                  } else if (!hasLength) {
                    return <span className="text-xs text-yellow-600">Need more detail</span>;
                  }
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>      {/* Procedure Section */}
      <div id="section-procedure" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.procedure)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Procedure</span>
          {getStatusIcon(sectionStatus.procedure)}
        </h2>
        <div className="space-y-4">
          {/* Equipment */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Equipment</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Air table</li>
              <li>• Two 505g pucks</li>
              <li>• Measurement tools (ruler/protractor)</li>
              <li>• Spark generator that will deliver one spark each 1/10 of a second through a wire in the puck to cause a small mark
 on the underside of the paper.</li>
            </ul>
          </div>

          {/* Trial Procedures */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Experimental Trials</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Trial 1: 1-D Head-on Collision</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  You will have one of the pucks motionless in the middle of the air table and hit it with the other puck in a head-on 1-D collision.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Trial 2: 2-D Glancing Collision</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  You will start again with one of the pucks motionless in the middle of the air table, but this time it will be hit by the other puck in a glancing 2-D collision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Simulation</span>
          {getStatusIcon(sectionStatus.simulation)}
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">            <p className="text-sm text-gray-600 mb-4">
              Use this interactive simulation to perform collision experiments. Adjust the launch angle to create different collision types 
              and observe how momentum is conserved. Record your observations for analysis. All angles are measured from the horizontal.
            </p>
            
            {/* Simulation Controls */}            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Launch Angle:</label>
                <input 
                  type="range"
                  min="-15"
                  max="15"
                  value={simulationState.launchAngle}
                  onChange={(e) => updateLaunchAngle(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={simulationState.isRunning}
                />
                <span className="text-sm text-gray-600 w-12">{simulationState.launchAngle}°</span>              </div>
              {/* Only show Start button if simulation hasn't been started yet */}
              {!simulationState.hasBeenStarted && (
                <button 
                  onClick={startSimulation}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={simulationState.isRunning}
                >
                  Start
                </button>
              )}
              <button 
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reset
              </button>
            </div>{/* Simulation Layout with Data on Left */}
            <div className="flex gap-4">
              {/* Data Display Column */}
              <div className="flex flex-col space-y-4 w-64">                <div className="bg-blue-50 p-3 rounded border text-sm">
                  <h4 className="font-semibold text-blue-800 mb-2">Puck 1 (Blue)</h4>
                  <div>Mass: {simulationState.puck1?.mass?.toFixed(0) || '0.0'} g</div>
                  {simulationState.hasCollided && simulationState.beforeCollision && (
                    <>                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="font-medium text-blue-700 mb-1">Before Collision:</div>
                        <div>Spacing: {simulationState.beforeCollision.puck1?.vx !== undefined && simulationState.beforeCollision.puck1?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.beforeCollision.puck1?.vx !== undefined && simulationState.beforeCollision.puck1?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-blue-700 mb-1">After Collision:</div>
                        <div>Spacing: {simulationState.afterCollision.puck1?.vx !== undefined && simulationState.afterCollision.puck1?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.afterCollision.puck1?.vx !== undefined && simulationState.afterCollision.puck1?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                    </>
                  )}
                </div>                <div className="bg-red-50 p-3 rounded border text-sm">
                  <h4 className="font-semibold text-red-800 mb-2">Puck 2 (Red)</h4>
                  <div>Mass: {simulationState.puck2?.mass?.toFixed(0) || '0.0'} g</div>
                  {simulationState.hasCollided && simulationState.beforeCollision && (
                    <>                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="font-medium text-red-700 mb-1">Before Collision:</div>
                        <div>Spacing: {simulationState.beforeCollision.puck2?.vx !== undefined && simulationState.beforeCollision.puck2?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.beforeCollision.puck2?.vx !== undefined && simulationState.beforeCollision.puck2?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy).toFixed(1) : '0.0'}°</div>
                      </div>                      <div className="mt-1">
                        <div className="font-medium text-red-700 mb-1">After Collision:</div>
                        <div>Spacing: {simulationState.afterCollision.puck2?.vx !== undefined && simulationState.afterCollision.puck2?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.afterCollision.puck2?.vx !== undefined && simulationState.afterCollision.puck2?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                    </>
                  )}
                </div>
                
              </div>

              {/* Physics Canvas */}
              <div className="relative border-2 border-gray-300 rounded-lg bg-white" style={{ width: '500px', height: '400px' }}>
                {/* Canvas background with grid */}
                <svg width="500" height="400" className="absolute inset-0">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                    </pattern>
                  </defs>                  <rect width="100%" height="100%" fill="url(#grid)" />                  {/* Spark Trail Dots - persistent, no fading */}
                  {simulationState.sparkTrail && simulationState.sparkTrail.map((dot, index) => (
                    <g key={`trail-${dot.timestamp}-${index}`}>
                      {/* Puck 1 trail dot */}
                      <circle 
                        cx={dot.puck1.x} 
                        cy={dot.puck1.y} 
                        r="2"
                        fill="#3b82f6"
                        opacity="0.8"
                      />
                      {/* Puck 2 trail dot */}
                      <circle 
                        cx={dot.puck2.x} 
                        cy={dot.puck2.y} 
                        r="2"
                        fill="#ef4444"
                        opacity="0.8"
                      />
                    </g>
                  ))}
                  
                  {/* Puck 1 - only show if visible */}
                  {simulationState.pucksVisible && (
                    <>
                      <circle 
                        cx={simulationState.puck1.x} 
                        cy={simulationState.puck1.y} 
                        r={simulationState.puck1.radius}
                        fill="#3b82f6"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />
                      <text 
                        x={simulationState.puck1.x} 
                        y={simulationState.puck1.y + 5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold"
                      >
                        1
                      </text>
                    </>
                  )}
                  
                  {/* Puck 2 - only show if visible */}
                  {simulationState.pucksVisible && (
                    <>
                      <circle 
                        cx={simulationState.puck2.x} 
                        cy={simulationState.puck2.y} 
                        r={simulationState.puck2.radius}
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth="2"
                      />
                      <text 
                        x={simulationState.puck2.x} 
                        y={simulationState.puck2.y + 5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold"
                      >                        2
                      </text>
                    </>
                  )}
                  
                  {/* Scale ruler - visual reference for measurements */}
                  <g>
                    {/* Main ruler line */}
                    <line x1="20" y1="380" x2="120" y2="380" stroke="#333" strokeWidth="2"/>
                    
                    {/* Tick marks every 10 pixels (1 cm) */}
                    <line x1="20" y1="375" x2="20" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="30" y1="377" x2="30" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="40" y1="377" x2="40" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="50" y1="375" x2="50" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="60" y1="377" x2="60" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="70" y1="377" x2="70" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="80" y1="377" x2="80" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="90" y1="377" x2="90" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="100" y1="375" x2="100" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="110" y1="377" x2="110" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="120" y1="375" x2="120" y2="385" stroke="#333" strokeWidth="1"/>
                    
                    {/* Labels */}
                    <text x="20" y="395" textAnchor="middle" fontSize="10" fill="#333">0</text>
                    <text x="70" y="395" textAnchor="middle" fontSize="10" fill="#333">5 cm</text>
                    <text x="120" y="395" textAnchor="middle" fontSize="10" fill="#333">10 cm</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Observations</span>
          {getStatusIcon(sectionStatus.observations)}
        </h2>
        <div className="space-y-6">
          <p className="text-gray-700">
            Record your observations from the simulation experiments. Complete at least 3 trials for each collision type 
            and document the momentum values before and after collision.
          </p>

          {/* Data Table for 1-D Collisions */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">1-D Collision Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">Trial</th>
                    <th className="border border-gray-300 p-2">Before Collision</th>
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">After Collision</th>
                    <th className="border border-gray-300 p-2"></th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">Puck 1 Momentum (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Puck 2 Momentum (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Puck 1 Momentum (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Puck 2 Momentum (kg⋅m/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(trial => (
                    <tr key={trial}>
                      <td className="border border-gray-300 p-2 text-center font-medium">{trial}</td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Table for 2-D Collisions */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">2-D Collision Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">Trial</th>
                    <th className="border border-gray-300 p-2" colSpan="2">Before Collision</th>
                    <th className="border border-gray-300 p-2" colSpan="2">After Collision</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">Total Momentum X (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Total Momentum Y (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Total Momentum X (kg⋅m/s)</th>
                    <th className="border border-gray-300 p-2">Total Momentum Y (kg⋅m/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(trial => (
                    <tr key={trial}>
                      <td className="border border-gray-300 p-2 text-center font-medium">{trial}</td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter value"
                          onChange={(e) => updateSectionContent('observations', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Qualitative Observations */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Qualitative Observations</h3>
            <textarea 
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Describe what you observed during the collisions. Note any patterns, unexpected results, or interesting phenomena..."
              value={sectionContent.observations || ''}
              onChange={(e) => updateSectionContent('observations', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Consider: How did the pucks behave? Did momentum appear to be conserved? What differences did you notice between 1-D and 2-D collisions?
            </p>
          </div>
        </div>
      </div>      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Analysis</span>
          {getStatusIcon(sectionStatus.analysis)}
        </h2>
        <div className="space-y-6">
          <p className="text-gray-700">
            Analyze your data to determine whether momentum was conserved in your collision experiments. 
            Show calculations and compare theoretical expectations with experimental results.
          </p>

          {/* Calculations Section */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Sample Calculations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">1-D Collision Analysis</h4>
                <textarea 
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                  placeholder="Show your calculations for momentum conservation in 1-D collisions:

Example:
Before collision: P₁ᵢ = m₁v₁ᵢ = (1.0 kg)(3.0 m/s) = 3.0 kg⋅m/s
                  P₂ᵢ = m₂v₂ᵢ = (1.5 kg)(0 m/s) = 0 kg⋅m/s
                  P_total_initial = 3.0 + 0 = 3.0 kg⋅m/s

After collision:  P₁f = m₁v₁f = (1.0 kg)(1.2 m/s) = 1.2 kg⋅m/s
                  P₂f = m₂v₂f = (1.5 kg)(1.2 m/s) = 1.8 kg⋅m/s
                  P_total_final = 1.2 + 1.8 = 3.0 kg⋅m/s

% Conservation = (P_final/P_initial) × 100% = (3.0/3.0) × 100% = 100%"
                  value={sectionContent.analysis1D || ''}
                  onChange={(e) => updateSectionContent('analysis1D', e.target.value)}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">2-D Collision Analysis</h4>
                <textarea 
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
                  placeholder="Show your calculations for momentum conservation in 2-D collisions:

Example:
X-direction:
Before: P_x_initial = P₁ₓᵢ + P₂ₓᵢ = (1.0)(2.0) + (1.5)(0) = 2.0 kg⋅m/s
After:  P_x_final = P₁ₓf + P₂ₓf = (1.0)(0.8) + (1.5)(0.8) = 2.0 kg⋅m/s

Y-direction:
Before: P_y_initial = P₁yᵢ + P₂yᵢ = (1.0)(1.0) + (1.5)(0) = 1.0 kg⋅m/s
After:  P_y_final = P₁yf + P₂yf = (1.0)(0.4) + (1.5)(0.4) = 1.0 kg⋅m/s"
                  value={sectionContent.analysis2D || ''}
                  onChange={(e) => updateSectionContent('analysis2D', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Comparison with Theory */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Comparison with Theoretical Expectations</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Compare your experimental results with the law of conservation of momentum. Discuss whether your results support the theoretical prediction..."
              value={sectionContent.analysisComparison || ''}
              onChange={(e) => updateSectionContent('analysisComparison', e.target.value)}
            />
          </div>

          {/* Percent Error Calculations */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Percent Error Analysis</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Calculate percent error between initial and final momentum for each trial. Show sample calculation:

% Error = |P_initial - P_final| / P_initial × 100%"
              value={sectionContent.analysisError || ''}
              onChange={(e) => updateSectionContent('analysisError', e.target.value)}
            />
          </div>

          {/* Overall Analysis */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Overall Analysis</h3>
            <textarea 
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Provide an overall analysis of your results. Address:
- Was momentum conserved in both 1-D and 2-D collisions?
- What factors might explain any deviations from perfect conservation?
- How do your results support or challenge the law of conservation of momentum?"
              value={sectionContent.analysisOverall || ''}
              onChange={(e) => updateSectionContent('analysisOverall', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error Section */}
      <div id="section-error" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.error)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Error</span>
          {getStatusIcon(sectionStatus.error)}
        </h2>        <div className="space-y-6">
          <p className="text-gray-700">
            Identify and analyze potential sources of error in your momentum conservation experiments. 
            Consider both systematic and random errors that might affect your results.
          </p>

          {/* Experimental Errors */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Experimental Error Sources</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Measurement Errors</h4>
                <textarea 
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  placeholder="Describe errors related to measuring velocities, masses, positions, or timing. Consider:
- Video frame rate limitations
- Ruler/scale precision
- Human reaction time in measurements"
                  value={sectionContent.errorMeasurement || ''}
                  onChange={(e) => updateSectionContent('errorMeasurement', e.target.value)}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Equipment Limitations</h4>
                <textarea 
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  placeholder="Discuss limitations of the experimental setup:
- Air table friction (not perfectly frictionless)
- Puck imperfections or wear
- Air pressure variations
- Camera angle and perspective errors"
                  value={sectionContent.errorEquipment || ''}
                  onChange={(e) => updateSectionContent('errorEquipment', e.target.value)}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Collision Characteristics</h4>
                <textarea 
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  placeholder="Analyze factors affecting the collision itself:
- Collisions not perfectly elastic
- Rotational motion of pucks
- Deformation during impact
- Multiple contact points"
                  value={sectionContent.errorCollision || ''}
                  onChange={(e) => updateSectionContent('errorCollision', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error Impact Analysis */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Impact on Results</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Analyze how these errors affected your momentum conservation results:
- Which errors had the greatest impact?
- Did errors tend to increase or decrease measured momentum?
- How might these errors be reduced in future experiments?"
              value={sectionContent.errorImpact || ''}
              onChange={(e) => updateSectionContent('errorImpact', e.target.value)}
            />
          </div>

          {/* Uncertainty Calculation */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Uncertainty Estimation</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
              placeholder="Estimate the uncertainty in your measurements:

Example:
Velocity measurement uncertainty: ±0.1 m/s
Mass measurement uncertainty: ±0.01 kg
Position measurement uncertainty: ±0.5 cm

Propagated momentum uncertainty:
δp = √[(δm × v)² + (m × δv)²]"
              value={sectionContent.errorUncertainty || ''}
              onChange={(e) => updateSectionContent('errorUncertainty', e.target.value)}
            />
          </div>

          {/* Improvements */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Suggested Improvements</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Suggest specific improvements to reduce errors:
- Better equipment or measurement techniques
- Modified experimental procedures
- Additional controls or calibrations
- Statistical methods to reduce random error"
              value={sectionContent.errorImprovements || ''}
              onChange={(e) => updateSectionContent('errorImprovements', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="section-conclusion" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.conclusion)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Conclusion</span>
          {getStatusIcon(sectionStatus.conclusion)}
        </h2>        <div className="space-y-6">
          <p className="text-gray-700">
            Summarize your findings and draw conclusions about momentum conservation based on your experimental results. 
            Address the original objective and hypothesis.
          </p>

          {/* Hypothesis Review */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Hypothesis Evaluation</h3>
            <textarea 
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Review your original hypothesis and state whether it was supported by your experimental results:
- Was your hypothesis correct?
- What evidence supports or contradicts your hypothesis?"
              value={sectionContent.conclusionHypothesis || ''}
              onChange={(e) => updateSectionContent('conclusionHypothesis', e.target.value)}
            />
          </div>

          {/* Key Findings */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Key Findings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">1-D Collision Results</h4>
                <textarea 
                  className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  placeholder="Summarize momentum conservation in 1-D collisions:
- Average percent error
- Whether momentum was conserved within experimental uncertainty"
                  value={sectionContent.conclusion1D || ''}
                  onChange={(e) => updateSectionContent('conclusion1D', e.target.value)}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">2-D Collision Results</h4>
                <textarea 
                  className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  placeholder="Summarize momentum conservation in 2-D collisions:
- Results for both x and y components
- Comparison with 1-D collision accuracy"
                  value={sectionContent.conclusion2D || ''}
                  onChange={(e) => updateSectionContent('conclusion2D', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Overall Assessment</h3>
            <textarea 
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Provide your overall assessment of momentum conservation:
- Does the law of conservation of momentum hold for both collision types?
- How significant were the experimental errors?
- What does this tell us about momentum as a fundamental physical principle?"
              value={sectionContent.conclusionOverall || ''}
              onChange={(e) => updateSectionContent('conclusionOverall', e.target.value)}
            />
          </div>

          {/* Real-World Applications */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Real-World Applications</h3>
            <textarea 
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Discuss how momentum conservation applies in real-world scenarios:
- Vehicle collisions and safety design
- Rocket propulsion
- Sports (billiards, hockey, etc.)
- Particle physics"
              value={sectionContent.conclusionApplications || ''}
              onChange={(e) => updateSectionContent('conclusionApplications', e.target.value)}
            />
          </div>

          {/* Further Investigation */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Further Investigation</h3>
            <textarea 
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Suggest areas for further investigation:
- How would results change with different mass ratios?
- What about inelastic collisions?
- How does rotational motion affect momentum conservation?
- Could you test momentum conservation in 3D?"
              value={sectionContent.conclusionFuture || ''}
              onChange={(e) => updateSectionContent('conclusionFuture', e.target.value)}
            />
          </div>

          {/* Final Statement */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Final Conclusion Statement</h3>
            <textarea 
              className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-none font-medium"
              placeholder="Write a clear, concise final statement answering the lab objective:
'Based on this investigation, momentum [is/is not] conserved during collisions because...'"
              value={sectionContent.conclusionFinal || ''}
              onChange={(e) => updateSectionContent('conclusionFinal', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab1_ConservationOfMomentum;
